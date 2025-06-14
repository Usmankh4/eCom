from django.db.models import Q
from django.utils import timezone
from ..models import Phone, PhoneVariant, Accessory

class ProductService:
    """
    Service class for product-related operations.
    Separates business logic from views.
    """
    
    @staticmethod
    def get_new_arrivals(limit=8):
        """
        Get new arrival products (both phone variants and accessories)
        """
        new_arrival_phones = PhoneVariant.objects.filter(
            is_active=True, 
            is_new_arrival=True
        ).select_related('phone')[:limit]
        
        new_arrival_accessories = Accessory.objects.filter(
            is_active=True,
            is_new_arrival=True
        )[:limit]
        
        return {
            'phones': new_arrival_phones,
            'accessories': new_arrival_accessories
        }
    
    @staticmethod
    def get_best_sellers(limit=8):
        """
        Get best seller products (both phone variants and accessories)
        """
        best_seller_phones = PhoneVariant.objects.filter(
            is_active=True, 
            is_best_seller=True
        ).select_related('phone')[:limit]
        
        best_seller_accessories = Accessory.objects.filter(
            is_active=True,
            is_best_seller=True
        )[:limit]
        
        return {
            'phones': best_seller_phones,
            'accessories': best_seller_accessories
        }
    
    @staticmethod
    def get_phone_details_by_slug(slug):
        """
        Get phone details and its variants by phone slug
        """
        try:
            phone = Phone.objects.get(slug=slug)
            variants = PhoneVariant.objects.filter(
                phone=phone,
                is_active=True
            )
            
            if not variants.exists():
                return None
                
            # Get related products (other phones from same brand)
            related_variants = PhoneVariant.objects.filter(
                is_active=True,
                phone__brand=phone.brand
            ).exclude(
                phone=phone
            ).select_related('phone').distinct('phone__id')[:4]
            
            return {
                'phone': phone,
                'variants': variants,
                'related_products': related_variants
            }
        except Phone.DoesNotExist:
            return None
    
    @staticmethod
    def get_accessory_details_by_slug(slug):
        """
        Get accessory details by slug
        """
        try:
            accessory = Accessory.objects.get(slug=slug, is_active=True)
            
            # Get related accessories
            related_accessories = Accessory.objects.filter(
                is_active=True
            ).exclude(
                id=accessory.id
            )[:4]
            
            return {
                'accessory': accessory,
                'related_products': related_accessories
            }
        except Accessory.DoesNotExist:
            return None
