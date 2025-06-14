from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.utils import timezone
import stripe
from django.conf import settings

# Set Stripe API key from settings
stripe.api_key = settings.STRIPE_SECRET_KEY if hasattr(settings, 'STRIPE_SECRET_KEY') else ''

class FlashDeal(models.Model):
   
    # Basic product information
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    
    # Product details
    brand = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    storage = models.CharField(max_length=50, blank=True, null=True)
    
    # Pricing
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, editable=False)
    
    # Inventory
    stock = models.PositiveIntegerField(default=0)
    reserved_stock = models.PositiveIntegerField(default=0)
    
    # Images
    image = models.ImageField(upload_to='flash_deals/', blank=True, null=True)
    
    # Flash deal timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Stripe integration
    stripe_price_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_product_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Flash Deal"
        verbose_name_plural = "Flash Deals"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_discount_percentage}% off"
    
    def clean(self):
        # Validate dates
        if self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date.")
        
        # Validate pricing
        if self.sale_price >= self.original_price:
            raise ValidationError("Sale price must be less than original price.")
        
        # Calculate discount percentage
        self.discount_percentage = self.calculate_discount_percentage()
    
    def save(self, *args, **kwargs):
        # Generate slug if not provided
        if not self.slug:
            base_slug = slugify(self.name)
            if self.color:
                base_slug += f"-{slugify(self.color)}"
            if self.storage:
                base_slug += f"-{slugify(self.storage)}"
                
            self.slug = base_slug
            n = 1
            while FlashDeal.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{n}"
                n += 1
        
        # Calculate discount percentage
        self.discount_percentage = self.calculate_discount_percentage()
        
        # Handle Stripe integration
        self._handle_stripe_integration()
        
        super().save(*args, **kwargs)
    
    def calculate_discount_percentage(self):
        """Calculate discount percentage based on original and sale prices"""
        if not self.original_price or not self.sale_price:
            return 0
        return round(((float(self.original_price) - float(self.sale_price)) / float(self.original_price)) * 100, 2)
    
    def _handle_stripe_integration(self):
        """Handle Stripe product and price creation/updates"""
        if not hasattr(settings, 'STRIPE_SECRET_KEY') or not stripe.api_key:
            return
        
        try:
            # Create or update Stripe product
            product_data = {
                'name': self.name,
                'description': self.description or '',
                'metadata': {
                    'flash_deal_id': str(self.id) if self.id else 'pending',
                    'brand': self.brand or '',
                    'color': self.color or '',
                    'storage': self.storage or ''
                }
            }
            
            if self.stripe_product_id:
                try:
                    product = stripe.Product.modify(self.stripe_product_id, **product_data)
                except stripe.error.InvalidRequestError:
                    # Product might be deleted in Stripe, create a new one
                    product = stripe.Product.create(**product_data)
                    self.stripe_product_id = product.id
            else:
                product = stripe.Product.create(**product_data)
                self.stripe_product_id = product.id
            
            # Create new price in Stripe
            if self.sale_price:
                price_in_cents = int(float(self.sale_price) * 100)
                
                # Deactivate old price if exists
                if self.stripe_price_id:
                    try:
                        stripe.Price.modify(self.stripe_price_id, active=False)
                    except Exception as e:
                        print(f"Error deactivating old Stripe price: {e}")
                
                # Create new price
                price = stripe.Price.create(
                    product=self.stripe_product_id,
                    unit_amount=price_in_cents,
                    currency='usd',
                    metadata={
                        'original_price': str(self.original_price),
                        'discount_percentage': str(self.discount_percentage),
                        'flash_deal_id': str(self.id) if self.id else 'pending'
                    }
                )
                self.stripe_price_id = price.id
                
        except Exception as e:
            print(f"Error handling Stripe integration: {e}")
    
    @property
    def is_ongoing(self):
        """Check if the flash deal is currently active"""
        now = timezone.now()
        return self.start_date <= now <= self.end_date and self.is_active
    
    @property
    def is_upcoming(self):
        """Check if the flash deal is upcoming"""
        now = timezone.now()
        return now < self.start_date and self.is_active
    
    @property
    def is_past(self):
        """Check if the flash deal has ended"""
        now = timezone.now()
        return now > self.end_date
    
    @property
    def available_stock(self):
        """Calculate available stock (total stock - reserved stock)"""
        return self.stock - self.reserved_stock
    
    def reserve_stock(self, quantity):
        """Reserve stock for an order"""
        if quantity > self.available_stock:
            return False
        self.reserved_stock += quantity
        self.save()
        return True
    
    def release_stock(self, quantity):
        """Release reserved stock"""
        self.reserved_stock = max(0, self.reserved_stock - quantity)
        self.save()
    
    def update_stock(self, new_stock):
        """Update total stock"""
        if new_stock < self.reserved_stock:
            raise ValidationError("Cannot set stock below reserved quantity.")
        self.stock = new_stock
        self.save()
