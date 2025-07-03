from django.utils import timezone
from django.db.models import Q
from django.core.cache import cache
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from .models import Phone, PhoneVariant, Accessory
from .serializers import PhoneSerializer, PhoneVariantSerializer, AccessorySerializer, ProductCardSerializer
from .services.product_service import ProductService


class ProductPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 20


class PhoneViewSet(viewsets.ReadOnlyModelViewSet):
    
    queryset = Phone.objects.all()
    serializer_class = PhoneSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'brand']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=True, methods=['get'])
    def variants(self, request, slug=None):
        """Get all variants for a specific phone"""
        phone = self.get_object()
        variants = phone.variants.filter(is_active=True)
        serializer = PhoneVariantSerializer(variants, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def details(self, request, slug=None):
        """Get detailed information about a phone with its variants"""
        cache_key = f'phone_detail_{slug}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        product_data = ProductService.get_phone_details_by_slug(slug)
        if not product_data:
            return Response(
                {"error": "Phone not found or has no active variants"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        response_data = {
            'phone': PhoneSerializer(product_data['phone'], context={'request': request}).data,
            'variants': PhoneVariantSerializer(
                product_data['variants'],
                many=True,
                context={'request': request}
            ).data,
            'related_products': PhoneVariantSerializer(
                product_data['related_products'],
                many=True,
                context={'request': request}
            ).data
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)


class PhoneVariantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing phone variants
    """
    queryset = PhoneVariant.objects.filter(is_active=True)
    serializer_class = PhoneVariantSerializer
    lookup_field = 'sku'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['phone__name', 'color', 'storage']
    ordering_fields = ['price', 'phone__name']
    
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get all new arrival phone variants"""
        cache_key = 'new_arrivals_phones'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        new_arrivals = self.queryset.filter(is_new_arrival=True)
        serializer = self.get_serializer(new_arrivals, many=True, context={'request': request})
        response_data = serializer.data
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        """Get all best seller phone variants"""
        cache_key = 'best_sellers_phones'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        best_sellers = self.queryset.filter(is_best_seller=True)
        serializer = self.get_serializer(best_sellers, many=True, context={'request': request})
        response_data = serializer.data
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)


class AccessoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing accessories
    """
    queryset = Accessory.objects.filter(is_active=True)
    serializer_class = AccessorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name']
    
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get all new arrival accessories"""
        cache_key = 'new_arrivals_accessories'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        new_arrivals = self.queryset.filter(is_new_arrival=True)
        serializer = self.get_serializer(new_arrivals, many=True, context={'request': request})
        response_data = serializer.data
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        """Get all best seller accessories"""
        cache_key = 'best_sellers_accessories'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        best_sellers = self.queryset.filter(is_best_seller=True)
        serializer = self.get_serializer(best_sellers, many=True, context={'request': request})
        response_data = serializer.data
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)
        
    @action(detail=True, methods=['get'])
    def details(self, request, slug=None):
        """Get detailed information about an accessory"""
        cache_key = f'accessory_detail_{slug}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        product_data = ProductService.get_accessory_details_by_slug(slug)
        if not product_data:
            return Response(
                {"error": "Accessory not found or not active"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        response_data = {
            'accessory': AccessorySerializer(
                product_data['accessory'],
                context={'request': request}
            ).data,
            'related_products': AccessorySerializer(
                product_data['related_products'],
                many=True,
                context={'request': request}
            ).data
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)


class NewArrivalsAPIView(APIView):
    """
    API endpoint for getting all new arrivals (phones and accessories)
    """
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def get(self, request, format=None):
        cache_key = 'new_arrivals'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        new_arrivals = ProductService.get_new_arrivals()
        
        response_data = {
            'products': PhoneVariantSerializer(
                new_arrivals['phones'],
                many=True,
                context={'request': request}
            ).data + AccessorySerializer(
                new_arrivals['accessories'],
                many=True,
                context={'request': request}
            ).data
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 15)
        return Response(response_data)


class BestSellersAPIView(APIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def get(self, request, format=None):
        cache_key = 'best_sellers'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        best_sellers = ProductService.get_best_sellers()
        
        response_data = {
            'products': PhoneVariantSerializer(
                best_sellers['phones'],
                many=True,
                context={'request': request}
            ).data + AccessorySerializer(
                best_sellers['accessories'],
                many=True,
                context={'request': request}
            ).data
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 5)
        
        return Response(response_data)


class HomePageAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        import logging
        logger = logging.getLogger(__name__)
        
        # Use CacheService for consistent caching with tagging
        from products.services.cache_service import CacheService
        
        # Generate query params for cache key
        params = {k: v for k, v in request.query_params.items() if k not in ['refresh']}
        
        # Skip cache if refresh parameter is present
        if not request.query_params.get('refresh'):
            cached_data = CacheService.get('homepage', 'data', params)
            if cached_data:
                logger.debug("Returning cached homepage data")
                return Response(cached_data)
        
        try:
            logger.debug("Fetching fresh homepage data")
            
            # Get new arrivals
            new_arrivals = ProductService.get_new_arrivals(limit=4)
            logger.debug(f"Fetched {len(new_arrivals['phones'])} new arrival phones and {len(new_arrivals['accessories'])} accessories")
            
            # Get best sellers
            best_sellers = ProductService.get_best_sellers(limit=4)
            logger.debug(f"Fetched {len(best_sellers['phones'])} best seller phones and {len(best_sellers['accessories'])} accessories")
            
            # Get featured phones (limit to 3)
            featured_phones = Phone.objects.prefetch_related('variants').all()[:3]
            logger.debug(f"Fetched {len(featured_phones)} featured phones")
            
            # Use the lightweight ProductCardSerializer for better performance
            response_data = {
                'new_arrivals': {
                    'phones': ProductCardSerializer(
                        new_arrivals['phones'],
                        many=True,
                        context={'request': request}
                    ).data,
                    'accessories': ProductCardSerializer(
                        new_arrivals['accessories'],
                        many=True,
                        context={'request': request}
                    ).data
                },
                'best_sellers': {
                    'phones': ProductCardSerializer(
                        best_sellers['phones'],
                        many=True,
                        context={'request': request}
                    ).data,
                    'accessories': ProductCardSerializer(
                        best_sellers['accessories'],
                        many=True,
                        context={'request': request}
                    ).data
                },
                'featured_phones': [
                    {
                        'id': phone.id,
                        'name': phone.name,
                        'slug': phone.slug,
                        'brand': phone.brand,
                        'variants_count': phone.variants.count(),
                        'price_range': self._get_price_range(phone.variants.all())
                    }
                    for phone in featured_phones
                ]
            }
            
            # Cache with tags for precise invalidation
            # This allows automatic invalidation when products change
            CacheService.set(
                'homepage', 'data', 
                response_data,
                timeout=60 * 5,  # 5 minutes
                params=params,
                tags=[
                    'homepage',
                    'new_arrivals',
                    'best_sellers'
                ]
            )
            logger.debug("Homepage data cached successfully with tags")
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error in HomePageAPIView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while fetching homepage data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_price_range(self, variants):
        """Helper method to get the price range for a phone's variants"""
        if not variants:
            return None
            
        prices = [variant.price for variant in variants if variant.is_active]
        if not prices:
            return None
            
        min_price = min(prices)
        max_price = max(prices)
        
        if min_price == max_price:
            return {'min': float(min_price), 'max': None}
        else:
            return {'min': float(min_price), 'max': float(max_price)}
