import json
from pathlib import Path

class ServiceNotFound(Exception):
    pass

class EndpointNotFound(Exception):
    pass


class ServiceRegistry:
    # Singleton
    _instance = None

    def __new__(cls, services_map=None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.services = services_map or {}
            cls._instance._validate_structure()
        return cls._instance
    
    def __init__(self, services_map):
        pass

    # -----------------------
    # Métodos principais
    # -----------------------

    def validate_service(self, service_name):
        if service_name not in self.services:
            raise ServiceNotFound(
                f'Serviço "{service_name}" não reconhecido.'
            )
        return self.services[service_name]

    def validate_endpoint(self, service_name, endpoint_key):
        service = self.validate_service(service_name)
        if endpoint_key not in service:
            raise EndpointNotFound(
                f'Endpoint "{endpoint_key}" não encontrado para o serviço "{service_name}".'
            )
        return service[endpoint_key]
    
    def _validate_structure(self):
        for service, endpoints in self.services.items():
            
            if not isinstance(endpoints, dict):
                raise ValueError(f'Serviço "{service}" deve ser um dict de endpoints.')
            
            if path is None:
                raise ValueError("Endpoint ... não foi configurado")

            for name, path in endpoints.items():
                if not isinstance(path, str):
                    raise ValueError(
                        f'Endpoint "{name}" do serviço "{service}" deve ser string.'
                    )
    # -----------------------
    # Helpers novos
    # -----------------------

    def get_endpoint(self, service_name, endpoint_key, **kwargs):
        """
        Retorna o endpoint formatado (ex: "/buscar/{id}" → "/buscar/15").
        """
        path = self.validate_endpoint(service_name, endpoint_key)
        if kwargs:
            return path.format(**kwargs)
        return path

    def list_services(self):
        """
        Lista todos os serviços registrados.
        """
        return list(self.services.keys())

    def list_endpoints(self, service_name):
        """
        Lista todos os endpoints de um serviço.
        """
        return list(self.validate_service(service_name).keys())