from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import json
from .services import chamar_endpoint
from .services.ServiceRegistry import (
    ServiceRegistry,
    ServiceNotFound,
    EndpointNotFound
)

from .services.gateway_config import ALL_SERVICES
from .services.auth import require_jwt
from .services.rate_limit import rate_limit
from .services.cache import cache_get,cache_set

# instância única
registry = ServiceRegistry(ALL_SERVICES)

class GatewayRouterAPIView(APIView):
    # A view só precisa responder a requisições GET para a API de leitura.
    def get(self, request, service_name, endpoint_key):
        
        # --------------------------
        # JWT
        # --------------------------
        # payload = require_jwt(request)
        # client_id = payload.get("sub")  # identificação do usuário
        
        # --------------------------
        # Rate Limit
        # --------------------------
        # rate_limit(client_id)

        # --------------------------
        # Validar rota
        # --------------------------
        try:
            endpoint_path = registry.validate_endpoint(service_name, endpoint_key)
        except (ServiceNotFound, EndpointNotFound) as e:
            return Response({'error': str(e)}, status=404)

        params = request.GET.dict()

        # --------------------------
        # Cache
        # --------------------------
        cached = cache_get(endpoint_path, params)
        if cached:
            return Response(cached, status=200)


        # 2. Chamar serviço externo
        resp = chamar_endpoint.api_client.chamar_endpoint(
            endpoint_path=endpoint_path,
            params=params
        )

        # 3. Verificação de erro de rede
        if resp is None:
            return Response({
                'error': 'Falha na comunicação com a API externa. O serviço retornou nulo.'
            }, status=503)

        # 4. Sucesso
        if 'content' in resp:
            return Response(resp['content'], status=resp.get('status', 200))

        # 5. Erro retornado pelo client
        return Response(
            {'error': resp.get('error', 'Erro desconhecido')},
            status=resp.get('status', 500)
        )