import time
import logging
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

class CacheMonitorMiddleware:
    """
    Middleware that logs cache hit/miss statistics and response times
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Initialize counters
        self.cache_hits = 0
        self.cache_misses = 0
        self.total_requests = 0

    def __call__(self, request):
        # Skip monitoring for admin and static requests
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return self.get_response(request)

        # Start timing
        start_time = time.time()
        
        # Store original cache get method to restore later
        original_get = cache.get
        
        # Counter for this request
        request_hits = 0
        request_misses = 0
        
        try:
            # Override cache.get to track hits and misses
            def monitored_get(key, default=None, version=None, **kwargs):
                nonlocal request_hits, request_misses
                try:
                    result = original_get(key, default=None, version=version, **kwargs)
                    if result is None:
                        request_misses += 1
                        logger.debug(f"Cache MISS: {key}")
                    else:
                        request_hits += 1
                        logger.debug(f"Cache HIT: {key}")
                    return result
                except Exception as e:
                    logger.error(f"Error in cache.get for key {key}: {e}")
                    return default
            
            # Replace cache.get with our monitored version
            cache.get = monitored_get
            
            # Process the request
            response = self.get_response(request)
        except Exception as e:
            # Log the error and ensure we restore the original cache.get
            logger.error(f"Error in CacheMonitorMiddleware: {e}")
            response = self.get_response(request)
        finally:
            # Always restore original cache.get
            cache.get = original_get
        
        try:
            # Calculate response time
            duration = time.time() - start_time
            
            # Update counters
            self.cache_hits += request_hits
            self.cache_misses += request_misses
            self.total_requests += 1
            
            # Log statistics for this request
            if request_hits > 0 or request_misses > 0:
                hit_ratio = request_hits / (request_hits + request_misses) * 100 if (request_hits + request_misses) > 0 else 0
                logger.info(
                    f"Path: {request.path} | Duration: {duration:.2f}s | "
                    f"Cache: {request_hits} hits, {request_misses} misses ({hit_ratio:.1f}% hit ratio)"
                )
            
            # Add cache statistics to response headers if debug is enabled
            if settings.DEBUG and hasattr(response, '__setitem__'):
                response['X-Cache-Hits'] = str(request_hits)
                response['X-Cache-Misses'] = str(request_misses)
                response['X-Response-Time'] = f"{duration:.2f}s"
        except Exception as e:
            logger.error(f"Error in CacheMonitorMiddleware stats: {e}")
        
        return response
