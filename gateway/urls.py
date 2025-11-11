from django.urls import path
from .views import gateway_router

urlpatterns = [
    path('<str:service_name>/<str:endpoint_key>/', gateway_router, name='gateway_router'),
]
