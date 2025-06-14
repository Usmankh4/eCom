from rest_framework import serializers
from .models import Phone, PhoneVariant, Accessory
from django.conf import settings


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
