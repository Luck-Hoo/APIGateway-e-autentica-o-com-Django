# login/views.py
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.urls import reverse
from .services import *

import time

def login(request, auth_service: InterfaceAuthService = DjangoAuthService()):

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = auth_service.authenticate_user(request, username=username, password=password)

            if user is not None:
                # Login Django (opcional, pode manter sessão)
                auth_login(request, user)
                request.session['last_login_time'] = time.time()

                # Gerar JWT
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                # Você pode enviar via JSON ou cookie
                response = redirect(request.POST.get('next') or reverse('produtos:index'))
                response.set_cookie('access_token', access_token, httponly=True)
                response.set_cookie('refresh_token', refresh_token, httponly=True)
                return response
            else:
                form.add_error(None, "Usuário ou senha inválidos.")
        return render(request, 'login/Login Inicial.html', {'form': form})

    else:
        form = AuthenticationForm()
        return render(request, 'login/Login Inicial.html', {'form': form})

    
def logout(request, auth_service: InterfaceAuthService = DjangoAuthService()):
    auth_service.logout_user(request)
    auth_logout(request)

    response = redirect(reverse('login:login'))
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response


def index_redirect(request):
    if request.user.is_authenticated:
        return redirect(reverse('produtos:ver_produto'))
    return redirect(reverse('login:login'))