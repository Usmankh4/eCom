from rest_framework import serializers
from store.models import Phone, PhoneVariant, Accessory
from django.db.models import Prefetch


class PhoneVariantDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()  # Add image field for frontend compatibility
    
    class Meta:
        model = PhoneVariant
        fields = [
            'id', 'sku', 'color', 'storage', 'price', 'stock',
            'is_active', 'is_new_arrival', 'is_best_seller', 'image_url', 'image'
        ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
        
    def get_image(self, obj):
        # Return the same URL as image_url for frontend compatibility
        return self.get_image_url(obj)


class PhoneDetailSerializer(serializers.ModelSerializer):
    variants = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    specifications = serializers.SerializerMethodField()
    rating = serializers.FloatField(default=4.5)
    review_count = serializers.IntegerField(default=0)
    image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Phone
        fields = [
            'id', 'name', 'slug', 'brand', 'description', 
            'variants', 'image', 'images', 'specifications',
            'rating', 'review_count', 'created_at', 'updated_at'
        ]
    
    def get_variants(self, obj):
        # Use prefetched variants if available to avoid additional queries
        variants = getattr(obj, 'prefetched_variants', None)
        if variants is None:
            variants = PhoneVariant.objects.filter(phone=obj, is_active=True)
        return PhoneVariantDetailSerializer(
            variants, 
            many=True, 
            context=self.context
        ).data
    
    def get_image(self, obj):
        request = self.context.get('request')
        # Use prefetched variants if available to avoid additional queries
        variants = getattr(obj, 'prefetched_variants', None)
        if variants and variants:
            variant = variants[0]
        else:
            variant = PhoneVariant.objects.filter(phone=obj, is_active=True).first()
        
        if variant and variant.image and hasattr(variant.image, 'url'):
            return request.build_absolute_uri(variant.image.url) if request else variant.image.url
        return None
    
    def get_specifications(self, obj):
        return {
            "Display": f"{obj.name} Display",
            "Processor": f"{obj.brand} Processor",
            "Camera": "12MP + 12MP + 12MP",
            "Battery": "4000mAh",
            "Operating System": "Android/iOS"
        }
        
    def get_images(self, obj):
        request = self.context.get('request')
        variants = getattr(obj, 'prefetched_variants', None) or obj.variants.filter(is_active=True)
        images = []
        
        for variant in variants:
            if variant.image and hasattr(variant.image, 'url'):
                image_url = request.build_absolute_uri(variant.image.url) if request else variant.image.url
                images.append({
                    'url': image_url,
                    'alt': f"{obj.brand} {obj.name} - {variant.color} {variant.storage}",
                    'color': variant.color,
                    'storage': variant.storage,
                    'variant_id': variant.id
                })
        
       
        if not images and variants.exists():
            first_variant = variants.first()
            if first_variant and first_variant.image and hasattr(first_variant.image, 'url'):
                image_url = request.build_absolute_uri(first_variant.image.url) if request else first_variant.image.url
                images.append({
                    'url': image_url,
                    'alt': f"{obj.brand} {obj.name}",
                    'variant_id': first_variant.id
                })
        
        return images


class AccessoryDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()  # Keep for backward compatibility
    images = serializers.SerializerMethodField()  
    specifications = serializers.SerializerMethodField()
    rating = serializers.FloatField(default=4.2)
    review_count = serializers.IntegerField(default=0)
    
    class Meta:
        model = Accessory
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock', 'is_active', 'is_new_arrival', 'is_best_seller',
            'image_url', 'images', 'specifications', 'rating', 'review_count',
            'created_at', 'updated_at'
        ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
    
    def get_specifications(self, obj):
        return {
            "Type": "Accessory",
            "Compatibility": "Universal",
            "Material": "Premium Quality",
            "Warranty": "1 Year"
        }
        
    def get_images(self, obj):
        # New method to provide consistent image array format
        request = self.context.get('request')
        images = []
        
        # Main product image
        if obj.image and hasattr(obj.image, 'url'):
            image_url = request.build_absolute_uri(obj.image.url) if request else obj.image.url
            images.append({
                'url': image_url,
                'alt': obj.name,
                'is_primary': True
            })
            
        # If no images were added, return an empty array
        return images


class BrandProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.SlugField()
    brand = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    image = serializers.SerializerMethodField()
    type = serializers.CharField()
    on_sale = serializers.BooleanField(default=False)
    is_new = serializers.BooleanField(default=False)
    rating = serializers.FloatField(default=0.0)
    review_count = serializers.IntegerField(default=0)
    original_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        allow_null=True
    )

    def get_image(self, obj):
        request = self.context.get('request')
        image_url = obj.get('image')
        
        if not image_url:
            return None
            
        if isinstance(image_url, str) and image_url.startswith(('http://', 'https://')):
            return image_url
            
        if request is not None and not image_url.startswith(('http://', 'https://')):
            return request.build_absolute_uri(image_url)
            
        return image_url


class PhoneVariantForBrandSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PhoneVariant
        fields = ['id', 'color', 'storage', 'price', 'image_url']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class PhoneForBrandSerializer(serializers.ModelSerializer):
    variants = PhoneVariantForBrandSerializer(many=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Phone
        fields = ['id', 'name', 'slug', 'brand', 'variants', 'image']
    
    def get_image(self, obj):
        variant = obj.variants.filter(is_active=True).first()
        if variant and variant.image and hasattr(variant.image, 'url'):
            request = self.context.get('request')
            return request.build_absolute_uri(variant.image.url) if request else variant.image.url
        return None


class AccessoryForBrandSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Accessory
        fields = ['id', 'name', 'slug', 'price', 'image_url']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None
