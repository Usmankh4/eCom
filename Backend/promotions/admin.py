from django.contrib import admin
from .models import FlashDeal


@admin.register(FlashDeal)
class FlashDealAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'brand', 'original_price', 'sale_price', 
        'discount_percentage', 'is_active', 'start_date', 'end_date', 'available_stock'
    )
    list_filter = ('is_active', 'brand', 'start_date', 'end_date')
    search_fields = ('name', 'description', 'brand')
    readonly_fields = (
        'created_at', 'updated_at', 'slug', 'discount_percentage',
        'stripe_price_id', 'stripe_product_id', 'available_stock'
    )
    date_hierarchy = 'start_date'
    list_per_page = 25
    
    fieldsets = (
        ('Product Information', {
            'fields': (
                'name', 'slug', 'description', 'brand', 
                'color', 'storage', 'image'
            )
        }),
        ('Pricing', {
            'fields': (
                'original_price', 'sale_price', 'discount_percentage',
                'stripe_price_id', 'stripe_product_id'
            )
        }),
        ('Inventory', {
            'fields': ('stock', 'reserved_stock', 'available_stock')
        }),
        ('Timing', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Metadata', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make slug read-only when editing an existing object"""
        if obj:  # editing an existing object
            return self.readonly_fields
        # For new objects, remove slug from readonly fields
        return tuple(f for f in self.readonly_fields if f != 'slug')
    
    def save_model(self, request, obj, form, change):
        """Save model and clear cache if needed"""
        from django.core.cache import cache
        super().save_model(request, obj, form, change)
        # Clear cache when a flash deal is saved
        cache.delete('active_flash_deals')
        cache.delete('active_flash_deals_public')
