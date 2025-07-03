from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import logging

from store.models import Phone, PhoneVariant, Accessory
from .services.cache_service import CacheService

logger = logging.getLogger(__name__)


@receiver([post_save, post_delete], sender=Phone)
def invalidate_phone_cache(sender, instance, **kwargs):
    """
    Invalidate cache when a phone is created, updated, or deleted
    """
    logger.info(f"Invalidating cache for phone: {instance.slug}")
    
    # Tag-based invalidation for precise and comprehensive cache clearing
    # Product-specific tags
    CacheService.invalidate_by_tag(f"product:{instance.id}")
    CacheService.invalidate_by_tag(f"product:{instance.slug}")
    
    # Brand-specific tags
    brand_lower = instance.brand.lower()
    CacheService.invalidate_by_tag(f"brand:{brand_lower}")
    
    # Always invalidate collection pages when products change
    CacheService.invalidate_by_tag("homepage")
    
    # Conditionally invalidate specific collections
    if hasattr(instance, 'is_new_arrival') and instance.is_new_arrival:
        CacheService.invalidate_by_tag("new_arrivals")
        
    if hasattr(instance, 'is_best_seller') and instance.is_best_seller:
        CacheService.invalidate_by_tag("best_sellers")
    
    # Special handling for Apple products
    if 'apple' in brand_lower:
        CacheService.invalidate_by_tag("brand:apple")
    
    logger.info(f"Successfully invalidated all caches for phone {instance.slug}")


@receiver([post_save, post_delete], sender=PhoneVariant)
def invalidate_variant_cache(sender, instance, **kwargs):
    """
    Invalidate cache when a phone variant is created, updated, or deleted
    """
    if hasattr(instance, 'phone') and instance.phone:
        logger.info(f"Invalidating cache for phone variant: {instance.phone.slug}")
        
        # Tag-based invalidation
        CacheService.invalidate_by_tag(f"product:{instance.phone.id}")
        CacheService.invalidate_by_tag(f"product:{instance.phone.slug}")
        
        # Brand-specific tags
        brand_lower = instance.phone.brand.lower()
        CacheService.invalidate_by_tag(f"brand:{brand_lower}")
        
        # Always invalidate homepage when variants change
        CacheService.invalidate_by_tag("homepage")
        
        # Conditionally invalidate specific collections
        if hasattr(instance, 'is_new_arrival') and instance.is_new_arrival:
            CacheService.invalidate_by_tag("new_arrivals")
            
        if hasattr(instance, 'is_best_seller') and instance.is_best_seller:
            CacheService.invalidate_by_tag("best_sellers")
        
        # Special handling for Apple products
        if 'apple' in brand_lower:
            CacheService.invalidate_by_tag("brand:apple")
        
        logger.info(f"Successfully invalidated all caches for phone variant {instance.id}")


@receiver([post_save, post_delete], sender=Accessory)
def invalidate_accessory_cache(sender, instance, **kwargs):
    """
    Invalidate cache when an accessory is created, updated, or deleted
    """
    logger.info(f"Invalidating cache for accessory: {instance.slug}")
    
    # Tag-based invalidation
    CacheService.invalidate_by_tag(f"product:{instance.id}")
    CacheService.invalidate_by_tag(f"product:{instance.slug}")
    
    # Always invalidate homepage for accessories
    CacheService.invalidate_by_tag("homepage")
    
    # Conditionally invalidate specific collections
    if hasattr(instance, 'is_new_arrival') and instance.is_new_arrival:
        CacheService.invalidate_by_tag("new_arrivals")
        
    if hasattr(instance, 'is_best_seller') and instance.is_best_seller:
        CacheService.invalidate_by_tag("best_sellers")
    
    logger.info(f"Successfully invalidated all caches for accessory {instance.slug}")
