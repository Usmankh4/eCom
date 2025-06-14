import pytest
from django.test import TestCase
from store.models import Phone, PhoneVariant, Accessory
from django.utils.text import slugify

@pytest.mark.django_db
class TestPhoneModel:
    def test_phone_creation(self):
        """Test Phone model creation and string representation"""
        phone = Phone.objects.create(
            name="Test Phone",
            brand="Test Brand",
            stripe_id="prod_test123"
        )
        assert phone.name == "Test Phone"
        assert phone.slug == slugify("Test Phone")
        assert phone.brand == "Test Brand"
        assert phone.stripe_id == "prod_test123"
        assert str(phone) == "Test Phone"

@pytest.mark.django_db
class TestPhoneVariantModel:
    def test_phone_variant_creation(self):
        """Test PhoneVariant model creation and string representation"""
        phone = Phone.objects.create(
            name="Test Phone",
            brand="Test Brand",
            stripe_id="prod_test123"
        )
        
        variant = PhoneVariant.objects.create(
            phone=phone,
            sku="TEST123",
            color="Black",
            storage="128GB",
            price=999.99,
            stock=10,
            stripe_price_id="price_test123"
        )
        
        assert variant.phone == phone
        assert variant.sku == "TEST123"
        assert variant.color == "Black"
        assert variant.storage == "128GB"
        assert variant.price == 999.99
        assert variant.stock == 10
        assert variant.stripe_price_id == "price_test123"
        assert variant.is_active is True
        assert str(variant) == "Test Phone - Black - 128GB"

@pytest.mark.django_db
class TestAccessoryModel:
    def test_accessory_creation(self):
        """Test Accessory model creation and string representation"""
        accessory = Accessory.objects.create(
            name="Test Accessory",
            description="Test Description",
            price=49.99,
            stock=20,
            stripe_id="prod_acc123",
            stripe_price_id="price_acc123"
        )
        
        assert accessory.name == "Test Accessory"
        assert accessory.slug == slugify("Test Accessory")
        assert accessory.description == "Test Description"
        assert accessory.price == 49.99
        assert accessory.stock == 20
        assert accessory.stripe_id == "prod_acc123"
        assert accessory.stripe_price_id == "price_acc123"
        assert accessory.is_active is True
        assert str(accessory) == "Test Accessory"
