from rest_framework import serializers
from .models import FlashDeal
from django.utils import timezone


class FlashDealSerializer(serializers.ModelSerializer):
    """
    Serializer for the FlashDeal model.
    Includes all fields and adds some computed fields for convenience.
    """
    is_ongoing = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    time_remaining = serializers.SerializerMethodField()
    available_stock = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = FlashDeal
        fields = [
            'id', 'name', 'slug', 'description', 
            'brand', 'color', 'storage',
            'original_price', 'sale_price', 'discount_percentage',
            'stock', 'reserved_stock', 'available_stock',
            'image', 'start_date', 'end_date', 'is_active',
            'is_ongoing', 'is_upcoming', 'is_past', 'time_remaining',
            'stripe_price_id', 'stripe_product_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'slug', 'discount_percentage']
    
    def get_time_remaining(self, obj):
        """
        Calculate and return the time remaining for the flash deal in seconds.
        Returns 0 if the deal has ended.
        """
        now = timezone.now()
        
        if now > obj.end_date:
            return 0
        
        if now < obj.start_date:
            # Deal hasn't started yet, return time until start
            return int((obj.start_date - now).total_seconds())
        
        # Deal is ongoing, return time until end
        return int((obj.end_date - now).total_seconds())
    
    def validate(self, data):
        """
        Validate the flash deal data.
        """
        # Ensure end date is after start date
        if 'start_date' in data and 'end_date' in data and data['end_date'] <= data['start_date']:
            raise serializers.ValidationError("End date must be after start date.")
        
        # Ensure sale price is less than original price
        if 'sale_price' in data and 'original_price' in data and data['sale_price'] >= data['original_price']:
            raise serializers.ValidationError("Sale price must be less than original price.")
        
        # Ensure stock is not negative
        if 'stock' in data and data['stock'] < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        
        # Ensure reserved_stock doesn't exceed stock
        if 'reserved_stock' in data and 'stock' in data and data['reserved_stock'] > data['stock']:
            raise serializers.ValidationError("Reserved stock cannot exceed total stock.")
        
        return data


class FlashDealListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing flash deals.
    """
    is_ongoing = serializers.BooleanField(read_only=True)
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = FlashDeal
        fields = [
            'id', 'name', 'slug', 'brand', 'image',
            'original_price', 'sale_price', 'discount_percentage',
            'start_date', 'end_date', 'is_ongoing', 'time_remaining'
        ]
    
    def get_time_remaining(self, obj):
        now = timezone.now()
        if now > obj.end_date:
            return 0
        if now < obj.start_date:
            return int((obj.start_date - now).total_seconds())
        return int((obj.end_date - now).total_seconds())
