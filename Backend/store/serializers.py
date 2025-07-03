from rest_framework import serializers
from .models import Phone, PhoneVariant, Accessory
from django.conf import settings


class ProductCardSerializer(serializers.Serializer):
    """
    Lightweight serializer for product cards with only the necessary fields.
    This is used for homepage, category pages, and other listing views.
    """
    id = serializers.IntegerField()
    name = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    image_url = serializers.SerializerMethodField()  # Frontend expects image_url, not image
    is_new_arrival = serializers.SerializerMethodField()  # Use snake_case as expected by mapProducts
    is_best_seller = serializers.SerializerMethodField()  # Use snake_case as expected by mapProducts
    
    def get_name(self, obj):
        # Handle PhoneVariant objects
        if hasattr(obj, 'phone'):
            return obj.phone.name
        # Handle Accessory objects
        return getattr(obj, 'name', 'Unknown Product')
    
    def get_slug(self, obj):
        # Handle PhoneVariant objects
        if hasattr(obj, 'phone'):
            return obj.phone.slug
        # Handle Accessory objects
        return getattr(obj, 'slug', '')
    
    def get_image_url(self, obj):
        """Return the image URL as expected by the frontend ProductCard component"""
        request = self.context.get('request')
        
        # Handle PhoneVariant objects
        if hasattr(obj, 'phone'):
            if obj.image:
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            return '/images/placeholder.png'
            
        # Handle Accessory objects
        elif hasattr(obj, 'image'):
            if obj.image:
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            return '/images/placeholder.png'
            
        return '/images/placeholder.png'
    
    def get_is_new_arrival(self, obj):
        return getattr(obj, 'is_new_arrival', False)
    
    def get_is_best_seller(self, obj):
        return getattr(obj, 'is_best_seller', False)


class PhoneVariantSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PhoneVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'price', 'stock', 
            'available_stock', 'image', 'image_url', 'is_active', 'is_new_arrival', 
            'is_best_seller'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add slug from parent phone
        representation['slug'] = instance.phone.slug if instance.phone else None
        representation['name'] = instance.phone.name if instance.phone else None
        return representation


class PhoneSerializer(serializers.ModelSerializer):
    variants = PhoneVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Phone
        fields = ['id', 'name', 'slug', 'brand', 'variants', 'created_at']


class AccessorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Accessory
        fields = [
            'id', 'name', 'slug', 'description', 'price', 
            'stock', 'image', 'image_url', 'is_active', 'created_at',
            'is_new_arrival', 'is_best_seller'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
