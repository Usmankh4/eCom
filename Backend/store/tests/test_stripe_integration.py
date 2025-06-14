import pytest
from unittest.mock import patch, MagicMock
from django.conf import settings
from store.models import Phone, PhoneVariant, Accessory

@pytest.fixture
def mock_stripe():
    with patch('stripe.Product.create') as mock_product_create, \
         patch('stripe.Price.create') as mock_price_create:
        
        mock_product = MagicMock()
        mock_product.id = 'prod_test123'
        mock_product_create.return_value = mock_product
        
        mock_price = MagicMock()
        mock_price.id = 'price_test123'
        mock_price_create.return_value = mock_price
        
        yield {
            'product_create': mock_product_create,
            'price_create': mock_price_create,
            'product': mock_product,
            'price': mock_price
        }

@pytest.mark.django_db
class TestStripeProductCreation:
    def test_phone_stripe_product_creation(self, mock_stripe):
        """Test creating a Stripe product when a Phone is created"""
        # This assumes you have a signal or method that creates Stripe products
        # when a Phone model is saved
        
        phone = Phone.objects.create(
            name="Test Phone",
            brand="Test Brand"
            # stripe_id should be set automatically by your signal/method
        )
        
        # Verify Stripe Product.create was called with correct arguments
        mock_stripe['product_create'].assert_called_once()
        args, kwargs = mock_stripe['product_create'].call_args
        assert kwargs['name'] == "Test Phone"
        
        # Verify the Stripe ID was saved to the model
        assert phone.stripe_id == 'prod_test123'
    
    def test_phone_variant_stripe_price_creation(self, mock_stripe):
        """Test creating a Stripe price when a PhoneVariant is created"""
        # Create a phone first
        phone = Phone.objects.create(
            name="Test Phone",
            brand="Test Brand",
            stripe_id="prod_test123"  # Set manually for this test
        )
        
        # Create a variant - this should trigger price creation
        variant = PhoneVariant.objects.create(
            phone=phone,
            sku="TEST123",
            color="Black",
            storage="128GB",
            price=999.99,
            stock=10
            # stripe_price_id should be set automatically
        )
        
        # Verify Stripe Price.create was called with correct arguments
        mock_stripe['price_create'].assert_called_once()
        args, kwargs = mock_stripe['price_create'].call_args
        assert kwargs['product'] == "prod_test123"
        assert kwargs['unit_amount'] == 99999  # Assuming conversion to cents
        assert kwargs['currency'] == 'usd'  # Assuming USD is your default
        
        # Verify the Stripe Price ID was saved to the model
        assert variant.stripe_price_id == 'price_test123'

@pytest.mark.django_db
class TestStripeAccessoryCreation:
    def test_accessory_stripe_creation(self, mock_stripe):
        """Test creating Stripe product and price when an Accessory is created"""
        
        accessory = Accessory.objects.create(
            name="Test Accessory",
            description="Test Description",
            price=49.99,
            stock=20
            # stripe_id and stripe_price_id should be set automatically
        )
        
        # Verify Stripe Product.create was called
        mock_stripe['product_create'].assert_called_once()
        
        # Verify Stripe Price.create was called
        mock_stripe['price_create'].assert_called_once()
        
        # Verify the Stripe IDs were saved to the model
        assert accessory.stripe_id == 'prod_test123'
        assert accessory.stripe_price_id == 'price_test123'
