from django.urls import path
from .views import ProductDetailView, BrandProductsView

urlpatterns = [
    path('products/brand/<str:brand>/', BrandProductsView.as_view(), name='brand-products'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
