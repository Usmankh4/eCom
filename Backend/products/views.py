from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
import logging
from rest_framework.pagination import PageNumberPagination

from store.models import Phone, PhoneVariant, Accessory
from .serializers import (
    PhoneDetailSerializer, 
    AccessoryDetailSerializer,
    BrandProductSerializer,
    PhoneForBrandSerializer,
    AccessoryForBrandSerializer
)


# Configure proper logging
logger = logging.getLogger(__name__)

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

class ProductDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get_cache_key(self, request, slug):
        """Generate a cache key based on slug and query parameters"""
        from .cache_utils import get_cache_key
        # Extract relevant query parameters that affect the response
        params = {k: v for k, v in request.GET.items() if k not in ['refresh']}
        return get_cache_key('product_detail', slug, params)
    
    def get(self, request, slug):
        # Create a more specific cache key including query parameters
        from .cache_utils import cache_get, cache_set
        
        # Skip cache if refresh parameter is present
        if request.GET.get('refresh'):
            logger.info(f"Bypassing cache for product {slug} due to refresh parameter")
        else:
            cached_data = cache_get('product_detail', slug, request.GET)
            if cached_data:
                logger.debug(f"Cache hit for product {slug}")
                return Response(cached_data)
            
        try:
            # Try to get phone with optimized query using select_related and prefetch_related
            # Use Prefetch to optimize variant loading and store as prefetched_variants
            from django.db.models import Prefetch
            phone = Phone.objects.prefetch_related(
                Prefetch('variants', 
                         queryset=PhoneVariant.objects.filter(is_active=True),
                         to_attr='prefetched_variants')
            ).get(slug=slug)
            
            # Log query performance
            logger.debug(f"Database query executed for phone {slug}")
            
            serializer = PhoneDetailSerializer(phone, context={'request': request})
            response_data = serializer.data
            response_data['type'] = 'phone'
            
            # Cache with different TTL based on product type
            from .cache_utils import cache_set
            cache_ttl = getattr(settings, 'CACHE_TTL', 60 * 15)  # Default 15 minutes
            cache_set('product_detail', slug, response_data, cache_ttl, request.GET)
            logger.debug(f"Cache set for phone {slug} with TTL {cache_ttl}s")
            return Response(response_data)
            
        except Phone.DoesNotExist:
            # Try accessory with optimized query
            try:
                # Get accessory with optimized query
                accessory = Accessory.objects.get(slug=slug)
                
                # Log query performance
                logger.debug(f"Database query executed for accessory {slug}")
                
                serializer = AccessoryDetailSerializer(accessory, context={'request': request})
                response_data = serializer.data
                response_data['type'] = 'accessory'
                
                # Cache accessory data
                from .cache_utils import cache_set
                cache_ttl = getattr(settings, 'CACHE_TTL', 60 * 15)
                cache_set('product_detail', slug, response_data, cache_ttl, request.GET)
                logger.debug(f"Cache set for accessory {slug} with TTL {cache_ttl}s")
                return Response(response_data)
                
            except Accessory.DoesNotExist:
                # Try flash deal with shorter cache time
                try:
                    from promotions.models import FlashDeal
                    from promotions.serializers import FlashDealDetailSerializer
                    
                    # Get flash deal with optimized query
                    flash_deal = FlashDeal.objects.select_related().prefetch_related('products').get(slug=slug)
                    
                    # Log query performance
                    logger.debug(f"Database query executed for flash deal {slug}")
                    
                    serializer = FlashDealDetailSerializer(flash_deal, context={'request': request})
                    response_data = serializer.data
                    response_data['type'] = 'flash_deal'
                    
                    # Cache flash deals for shorter time (5 minutes)
                    from .cache_utils import cache_set
                    flash_deal_ttl = 60 * 5  # 5 minutes
                    cache_set('product_detail', slug, response_data, flash_deal_ttl, request.GET)
                    logger.debug(f"Cache set for flash deal {slug} with TTL {flash_deal_ttl}s")
                    return Response(response_data)
                    
                except (ImportError, FlashDeal.DoesNotExist):
                    return Response(
                        {"detail": "Product not found"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )


class BrandProductsView(APIView):
    """
    API endpoint to fetch products by brand
    """
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination
    
    def get(self, request, brand):
        brand_lower = brand.lower()
        logger.info(f"BrandProductsView: Received request for brand '{brand_lower}'")
        
        # Use CacheService for consistent caching with tagging
        from .services.cache_service import CacheService
        
        # Generate query params for cache key
        params = {k: v for k, v in request.GET.items() if k not in ['refresh']}
        
        # Skip cache if refresh parameter is present
        if request.GET.get('refresh'):
            logger.info(f"Cache bypass requested for brand '{brand_lower}'")
            cached_data = None
        else:
            try:
                cached_data = CacheService.get('brand_products', brand_lower, params)
                if cached_data:
                    logger.debug(f"Cache hit for brand '{brand_lower}'")
                    return Response(cached_data)
            except Exception as e:
                logger.error(f"Error retrieving cache for brand '{brand_lower}': {str(e)}")
                cached_data = None
        
        # Start timing the database queries
        import time
        start_time = time.time()
        
        # Query phones with variants in a single query with optimized prefetch_related
        phone_filters = Q(brand__iexact=brand_lower)
        
        # Special case for Apple (to include both 'Apple' and 'iPhone' in name)
        if brand_lower == 'apple':
            phone_filters = Q(brand__iexact='apple') & Q(name__icontains='iphone')
        
        # Use prefetch_related to optimize queries
        # Only select active variants to reduce data load
        phones = Phone.objects.prefetch_related(
            'variants'
        ).filter(
            phone_filters,
            variants__is_active=True  # Only include phones with active variants
        ).distinct()
        
        # Log query performance
        phones_query_time = time.time() - start_time
        logger.debug(f"Phone query for brand '{brand_lower}' took {phones_query_time:.4f}s")
        
        # Reset timer for accessories query
        start_time = time.time()
        
        # Query accessories - search in name since there's no brand field
        # Only select active accessories
        accessories = Accessory.objects.filter(
            name__icontains=brand_lower,
            is_active=True
        )
        
        # If brand is 'apple', also include accessories with 'iphone' in the name
        if brand_lower == 'apple':
            accessories = accessories | Accessory.objects.filter(
                name__icontains='iphone',
                is_active=True
            )
            
        # Log query performance
        accessories_query_time = time.time() - start_time
        logger.debug(f"Accessories query for brand '{brand_lower}' took {accessories_query_time:.4f}s")
        
        # Serialize data
        phone_serializer = PhoneForBrandSerializer(
            phones, 
            many=True,
            context={'request': request}
        )
        
        accessory_serializer = AccessoryForBrandSerializer(
            accessories,
            many=True,
            context={'request': request}
        )
        
        # Combine and format the data
        products = []
        
        # Process phones
        for phone_data in phone_serializer.data:
            if phone_data['variants']:
                base_variant = phone_data['variants'][0]
                product_data = {
                    'id': phone_data['id'],
                    'name': phone_data['name'],
                    'slug': phone_data['slug'],
                    'brand': phone_data['brand'],
                    'price': float(base_variant['price']),
                    'image': base_variant['image_url'] or phone_data['image'],
                    'type': 'phone',
                    'on_sale': False,
                    'is_new': any(v.get('is_new_arrival', False) for v in phone_data['variants']),
                    'rating': 4.5,  # Default rating, replace with actual if available
                    'review_count': 0  # Default review count
                }
                products.append(product_data)
        
        # Process accessories
        for accessory_data in accessory_serializer.data:
            product_data = {
                'id': f"a{accessory_data['id']}",  # Prefix to avoid ID collision
                'name': accessory_data['name'],
                'slug': accessory_data['slug'],
                'brand': brand_lower.capitalize(),
                'price': float(accessory_data['price']),
                'image': accessory_data['image_url'],
                'type': 'accessory',
                'on_sale': False,
                'is_new': accessory_data.get('is_new_arrival', False),
                'rating': 4.2,  # Default rating
                'review_count': 0  # Default review count
            }
            products.append(product_data)
        
        # Apply flash deals if any
        try:
            # Start timing flash deals query
            start_time = time.time()
            
            from promotions.models import FlashDeal
            # Optimize flash deals query with select_related
            active_flash_deals = FlashDeal.objects.select_related().filter(
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now()
            )
            
            # Log query performance
            flash_deals_query_time = time.time() - start_time
            logger.debug(f"Flash deals query took {flash_deals_query_time:.4f}s")
            
            if active_flash_deals.exists():
                for product in products:
                    for deal in active_flash_deals:
                        if deal.applies_to_product(product['id'], product['type']):
                            product['on_sale'] = True
                            product['original_price'] = product['price']
                            product['price'] = deal.calculate_discounted_price(product['price'])
                            break
        except (ImportError, AttributeError) as e:
            print(f"BrandProductsView: Error applying flash deals: {str(e)}")
        
        # Cache the results using CacheService with tags for precise invalidation
        # Use a shorter cache TTL for brand products (5 minutes)
        cache_ttl = getattr(settings, 'BRAND_CACHE_TTL', 60 * 5)  # 5 minutes default
        
        # Use the BrandProductSerializer to ensure consistent output format
        serializer = BrandProductSerializer(products, many=True, context={'request': request})
        
        # Cache the serialized data with appropriate tags
        CacheService.set(
            'brand_products', 
            brand_lower, 
            serializer.data, 
            timeout=cache_ttl, 
            params=params,
            tags=[
                f'brand:{brand_lower}',
                'brand_products'
            ]
        )
        logger.debug(f"Cache set for brand '{brand_lower}' with TTL {cache_ttl}s and tags")
        return Response(serializer.data)
