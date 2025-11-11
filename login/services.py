
from django.contrib.auth import authenticate
from abc import ABC, abstractmethod
from django.http import HttpRequest

# Interface
class InterfaceAuthService(ABC):
    @abstractmethod
    def authenticate_user(self, request: HttpRequest, username: str, password: str):
        pass

# Implementação LDAP
class DjangoAuthService(InterfaceAuthService):
    def authenticate_user(self, request: HttpRequest, username: str, password: str):
        return authenticate(request, username=username, password=password)

