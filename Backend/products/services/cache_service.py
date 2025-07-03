import logging
from django.core.cache import cache
from django.conf import settings
from django_redis import get_redis_connection

logger = logging.getLogger(__name__)


class CacheService:
    """
    Redis-optimized service for all cache operations with tagging support
    """
    
    @classmethod
    def get_key(cls, prefix, identifier, params=None):
        """Generate standardized cache key with version support"""
        version = getattr(settings, 'CACHE_VERSION', 1)
        key = f"{prefix}:{identifier}"
        
        if params:
            if isinstance(params, dict):
                # Sort params for consistent keys
                sorted_params = sorted(params.items())
                params_str = ":".join(f"{k}={v}" for k, v in sorted_params)
                key = f"{key}:{params_str}"
            else:
                key = f"{key}:{params}"
        
        # Add version and key prefix from settings
        key_prefix = getattr(settings, 'CACHES', {}).get('default', {}).get('KEY_PREFIX', 'ecom')
        return f"{key_prefix}:v{version}:{key}"
    
    @classmethod
    def get(cls, prefix, identifier, params=None):
        """Get cached value with standardized key"""
        key = cls.get_key(prefix, identifier, params)
        return cache.get(key)
    
    @classmethod
    def set(cls, prefix, identifier, data, timeout=None, params=None, tags=None):
        """
        Set cache with standardized key and maintain tag registry using Redis sets
        
        Args:
            prefix: Content type prefix (e.g., 'product_detail')
            identifier: Unique identifier (e.g., slug)
            data: Data to cache
            timeout: Cache TTL in seconds
            params: Optional query parameters
            tags: List of tags to associate with this cache entry
        """
        if timeout is None:
            # Use content-specific TTL
            cache_settings = getattr(settings, 'CACHE_SETTINGS', {})
            ttl_mapping = {
                'product_detail': cache_settings.get('PRODUCT_DETAIL_TTL', 60 * 30),
                'brand_products': cache_settings.get('BRAND_PRODUCTS_TTL', 60 * 10),
                'homepage': cache_settings.get('HOMEPAGE_TTL', 60 * 15),
                'category': cache_settings.get('CATEGORY_TTL', 60 * 60),
                'static': cache_settings.get('STATIC_TTL', 60 * 60 * 24),
            }
            timeout = ttl_mapping.get(prefix, cache_settings.get('DYNAMIC_TTL', 60 * 5))
        
        key = cls.get_key(prefix, identifier, params)
        cache.set(key, data, timeout)
        
        # Register this key with its tags using Redis sets
        if tags:
            try:
                # Get direct Redis connection for set operations
                redis_conn = get_redis_connection("default")
                
                for tag in tags:
                    tag_key = f"tag:{tag}"
                    # Add key to the tag set (Redis SADD operation)
                    redis_conn.sadd(tag_key, key)
                    logger.debug(f"Tagged cache key {key} with {tag}")
            except Exception as e:
                logger.error(f"Error adding cache tags: {e}")
    
    @classmethod
    def invalidate_by_tag(cls, tag):
        """
        Invalidate all cache entries with a specific tag
        Uses Redis SMEMBERS and pipeline for atomic operations
        """
        try:
            redis_conn = get_redis_connection("default")
            tag_key = f"tag:{tag}"
            
            # Get all keys in this tag set
            tagged_keys = redis_conn.smembers(tag_key)
            
            if not tagged_keys:
                logger.debug(f"No cache entries found for tag {tag}")
                return 0
            
            # Use Redis pipeline for atomic multi-operation
            pipe = redis_conn.pipeline()
            
            # Delete all keys in the tag
            for key in tagged_keys:
                if isinstance(key, bytes):
                    key = key.decode('utf-8')
                pipe.delete(key)
            
            # Delete the tag set itself
            pipe.delete(tag_key)
            
            # Execute all commands in a single Redis roundtrip
            results = pipe.execute()
            
            # Count successful deletions (excluding the tag set deletion)
            deleted = sum(results[:-1])
            logger.info(f"Invalidated {deleted} cache entries with tag {tag}")
            return deleted
            
        except Exception as e:
            logger.error(f"Error invalidating cache by tag {tag}: {e}")
            return 0
    
    @classmethod
    def invalidate_by_prefix(cls, prefix):
        """
        Invalidate all cache entries with a given prefix
        Uses Redis SCAN for efficient key pattern matching
        """
        try:
            redis_conn = get_redis_connection("default")
            key_prefix = getattr(settings, 'CACHES', {}).get('default', {}).get('KEY_PREFIX', 'ecom')
            pattern = f"{key_prefix}:*{prefix}*"
            
            # Use SCAN instead of KEYS for production safety
            count = 0
            cursor = '0'
            while cursor != 0:
                cursor, keys = redis_conn.scan(cursor=cursor, match=pattern, count=1000)
                if keys:
                    redis_conn.delete(*keys)
                    count += len(keys)
                
                # Convert string cursor to int for comparison
                cursor = int(cursor)
            
            logger.info(f"Invalidated {count} cache entries with prefix {prefix}")
            return count
            
        except Exception as e:
            logger.error(f"Error invalidating cache with prefix {prefix}: {e}")
            return 0
    
    @classmethod
    def get_cache_stats(cls):
        """
        Get Redis cache statistics for monitoring
        """
        try:
            redis_conn = get_redis_connection("default")
            stats = {
                'used_memory': redis_conn.info('memory')['used_memory_human'],
                'hits': redis_conn.info('stats')['keyspace_hits'],
                'misses': redis_conn.info('stats')['keyspace_misses'],
                'keys': redis_conn.dbsize()
            }
            
            if stats['hits'] + stats['misses'] > 0:
                stats['hit_ratio'] = stats['hits'] / (stats['hits'] + stats['misses'])
            else:
                stats['hit_ratio'] = 0
                
            return stats
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}
