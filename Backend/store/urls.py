from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'store'

router = DefaultRouter()
router.register('phones', views.PhoneViewSet, basename='phone')
router.register('variants', views.PhoneVariantViewSet, basename='variant')
router.register('accessories', views.AccessoryViewSet, basename='accessory')

urlpatterns = [
    path('', include(router.urls)),
    path('new-arrivals/', views.NewArrivalsAPIView.as_view(), name='new-arrivals'),
    path('best-sellers/', views.BestSellersAPIView.as_view(), name='best-sellers'),
    path('homepage/', views.HomePageAPIView.as_view(), name='homepage'),
]
