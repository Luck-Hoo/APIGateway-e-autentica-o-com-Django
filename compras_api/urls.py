from django.urls import path
from . import views

app_name = 'compras-api'

urlpatterns = [
    path('catalogo-material/', views.catalogo_material, name='catalogo-material'),
    path('contratacoes/', views.contratacoes, name='contratacoes')
]