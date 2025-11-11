from django.contrib import admin
from django.urls import path, include
from . import views

app_name = 'login'

urlpatterns = [
    path('', views.index_redirect, name='index_redirect'),
    path('login', views.login, name='login'),
    path('logout',views.logout, name='logout')
]
