from django.urls import path
from .views import GatewayRouterAPIView

urlpatterns = [
    path('<str:service_name>/<str:endpoint_key>/', GatewayRouterAPIView.as_view()),
]
