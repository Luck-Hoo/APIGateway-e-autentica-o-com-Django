"""
URL configuration for aprendendo07011 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls', namespace='home')),
    path('login/', include('login.urls'), name='login'),
    path('gateway/', include('gateway.urls'), name='gateway'),
    path('compras_api/', include('compras_api.urls', namespace='compras_api'), name='compras_api'),

    # --- ROTAS SWAGGER/OPENAPI ---
    
    # 1. Endpoint para o arquivo SCHEMA (JSON/YAML)
    # URL: /api/schema/
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # 2. Rota para o SWAGGER UI (Interface Interativa)
    # URL: /api/schema/swagger-ui/
    path(
        'api/schema/swagger-ui/', 
        SpectacularSwaggerView.as_view(url_name='schema'), 
        name='swagger-ui'
    ),
    
    # 3. Rota para o REDOC (Documentação de Estilo de Livro)
    # URL: /api/schema/redoc/
    path(
        'api/schema/redoc/', 
        SpectacularRedocView.as_view(url_name='schema'), 
        name='redoc'
    ),
]
