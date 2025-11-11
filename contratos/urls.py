from django.urls import path
from . import views

app_name = 'contratos'

urlpatterns = [
    path('contratos/', views.contratos, name='contratos')
]