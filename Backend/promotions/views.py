from django.utils import timezone
from django.db.models import Q
from django.core.cache import cache
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import FlashDeal
from .serializers import FlashDealSerializer, FlashDealListSerializer


class FlashDealViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing flash deals.
    """
    queryset = FlashDeal.objects.all().order_by('-created_at')
    serializer_class = FlashDealSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'brand', 'description']
    ordering_fields = [
        'start_date', 'end_date', 'created_at', 'sale_price', 
        'original_price', 'discount_percentage'
    ]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'active']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Use different serializers for list and detail views.
        """
        if self.action == 'list':
            return FlashDealListSerializer
        return FlashDealSerializer
    
    def get_queryset(self):
        """
        Optionally filter by active status or time period.
        """
        queryset = FlashDeal.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        # Filter by time period
        time_period = self.request.query_params.get('time_period', None)
        now = timezone.now()
        
        if time_period == 'active':
            queryset = queryset.filter(start_date__lte=now, end_date__gte=now, is_active=True)
        elif time_period == 'upcoming':
            queryset = queryset.filter(start_date__gt=now, is_active=True)
        elif time_period == 'past':
            queryset = queryset.filter(end_date__lt=now)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active flash deals (both ongoing and upcoming).
        """
        # Use cache to improve performance
        cache_key = 'active_flash_deals'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        now = timezone.now()
        flash_deals = FlashDeal.objects.filter(
            is_active=True,
            end_date__gte=now  # Only include deals that haven't ended yet
        ).order_by('start_date')
        
        serializer = self.get_serializer(flash_deals, many=True)
        data = serializer.data
        
        # Cache for a short time (5 minutes) since flash deals are time-sensitive
        cache.set(cache_key, data, 60 * 5)
        
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, slug=None):
        """
        Toggle the active status of a flash deal.
        """
        flash_deal = self.get_object()
        flash_deal.is_active = not flash_deal.is_active
        flash_deal.save()
        
        # Clear the cache when status changes
        cache.delete('active_flash_deals')
        
        return Response({
            'status': 'success',
            'is_active': flash_deal.is_active
        })


class ActiveFlashDealsAPIView(APIView):
    """
    API endpoint for getting all active flash deals.
    This is a read-only view that's accessible to anyone.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        """
        Get all active flash deals (both ongoing and upcoming).
        """
        # Use cache to improve performance
        cache_key = 'active_flash_deals_public'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        now = timezone.now()
        flash_deals = FlashDeal.objects.filter(
            is_active=True,
            end_date__gte=now  # Only include deals that haven't ended yet
        ).order_by('start_date')
        
        serializer = FlashDealListSerializer(flash_deals, many=True, context={'request': request})
        data = serializer.data
        
        # Cache for a short time (5 minutes) since flash deals are time-sensitive
        cache.set(cache_key, data, 60 * 5)
        
        return Response(data)
