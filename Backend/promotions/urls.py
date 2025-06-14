from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'promotions'

router = DefaultRouter()
router.register('flash-deals', views.FlashDealViewSet, basename='flash-deal')

urlpatterns = [
    path('', include(router.urls)),
    path('active-flash-deals/', views.ActiveFlashDealsAPIView.as_view(), name='active-flash-deals'),
]
