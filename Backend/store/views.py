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
from .serializers import PhoneSerializer, PhoneVariantSerializer, AccessorySerializer
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
    """
    API endpoint for getting all best sellers (phones and accessories)
    """
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
    """
    API endpoint for the homepage, combining multiple data sources
    """
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        cache_key = 'homepage'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Get new arrivals
        new_arrivals = ProductService.get_new_arrivals(limit=4)
        
        # Get best sellers
        best_sellers = ProductService.get_best_sellers(limit=4)
        
        featured_phones = Phone.objects.all()[:3]        
        response_data = {
            'new_arrivals': {
                'phones': PhoneVariantSerializer(
                    new_arrivals['phones'],
                    many=True,
                    context={'request': request}
                ).data,
                'accessories': AccessorySerializer(
                    new_arrivals['accessories'],
                    many=True,
                    context={'request': request}
                ).data
            },
            'best_sellers': {
                'phones': PhoneVariantSerializer(
                    best_sellers['phones'],
                    many=True,
                    context={'request': request}
                ).data,
                'accessories': AccessorySerializer(
                    best_sellers['accessories'],
                    many=True,
                    context={'request': request}
                ).data
            },
            'featured_phones': PhoneSerializer(
                featured_phones,
                many=True,
                context={'request': request}
            ).data
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, response_data, 60 * 5)
        
        return Response(response_data)
