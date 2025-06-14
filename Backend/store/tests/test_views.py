import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from store.models import Phone, PhoneVariant, Accessory
from django.contrib.auth.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_phone():
    def _create_phone(name="Test Phone", brand="Test Brand", stripe_id="prod_test123"):
        phone = Phone.objects.create(
            name=name,
            brand=brand,
            stripe_id=stripe_id
        )
        return phone
    return _create_phone

@pytest.fixture
def create_phone_variant():
    def _create_variant(phone, color="Black", storage="128GB", price=999.99):
        variant = PhoneVariant.objects.create(
            phone=phone,
            sku=f"{phone.name}-{color}-{storage}".replace(" ", ""),
            color=color,
            storage=storage,
            price=price,
            stock=10,
            stripe_price_id=f"price_{phone.stripe_id}_{color}_{storage}"
        )
        return variant
    return _create_variant

@pytest.fixture
def create_accessory():
    def _create_accessory(name="Test Accessory", price=49.99):
        accessory = Accessory.objects.create(
            name=name,
            description=f"Description for {name}",
            price=price,
            stock=20,
            stripe_id=f"prod_acc_{name.lower().replace(' ', '_')}",
            stripe_price_id=f"price_acc_{name.lower().replace(' ', '_')}"
        )
        return accessory
    return _create_accessory

@pytest.mark.django_db
class TestPhoneListAPI:
    def test_get_phone_list(self, api_client, create_phone):
        # Create test phones
        phone1 = create_phone(name="iPhone 15")
        phone2 = create_phone(name="Galaxy S23", brand="Samsung")
        
        # Get API response
        url = reverse('phone-list')
        response = api_client.get(url)
        
        # Check response
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert response.data[0]['name'] == phone1.name
        assert response.data[1]['name'] == phone2.name

@pytest.mark.django_db
class TestPhoneDetailAPI:
    def test_get_phone_detail(self, api_client, create_phone, create_phone_variant):
        # Create test phone with variants
        phone = create_phone(name="iPhone 15")
        variant1 = create_phone_variant(phone, color="Black", storage="128GB")
        variant2 = create_phone_variant(phone, color="Blue", storage="256GB")
        
        # Get API response
        url = reverse('phone-detail', args=[phone.slug])
        response = api_client.get(url)
        
        # Check response
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == phone.name
        assert len(response.data['variants']) == 2
        assert response.data['variants'][0]['color'] == variant1.color
        assert response.data['variants'][1]['color'] == variant2.color

@pytest.mark.django_db
class TestAccessoryAPI:
    def test_get_accessories_list(self, api_client, create_accessory):
        # Create test accessories
        acc1 = create_accessory(name="Phone Case")
        acc2 = create_accessory(name="Charger", price=29.99)
        
        # Get API response
        url = reverse('accessory-list')
        response = api_client.get(url)
        
        # Check response
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert response.data[0]['name'] == acc1.name
        assert response.data[1]['name'] == acc2.name
