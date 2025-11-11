from django.http import JsonResponse, HttpResponse
from django.core.cache import cache
import hashlib
import json
from .services import compras_api  # importa serviços específicos

CACHE_TIMEOUT = 300  # 5 minutos

def gateway_router(request, service_name, endpoint_key):
    # Criar chave de cache
    key_source = f"{request.method}:{service_name}:{endpoint_key}:{json.dumps(request.GET, sort_keys=True)}"
    cache_key = "gateway_cache_" + hashlib.md5(key_source.encode()).hexdigest()

    cached_response = cache.get(cache_key)
    if cached_response:
        return HttpResponse(
            cached_response['content'],
            status=cached_response['status'],
            content_type=cached_response['content_type']
        )

    # Delegar para service
    if service_name == 'compras' and endpoint_key == 'orgaos':
        resp = compras_api.get_orgaos(params=request.GET)
    else:
        return JsonResponse({'error': 'Serviço ou endpoint não encontrado'}, status=404)

    # Salvar no cache
    if 'content' in resp:
        cache.set(cache_key, resp, CACHE_TIMEOUT)
        return HttpResponse(resp['content'], status=resp['status'], content_type=resp['content_type'])
    else:
        return JsonResponse({'error': resp.get('error', 'Erro desconhecido')}, status=resp.get('status', 500))
