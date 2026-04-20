from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TruckViewSet, DriverViewSet, JobViewSet, RegisterView, LoginView

router = DefaultRouter()
router.register(r'trucks', TruckViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'jobs', JobViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
]
