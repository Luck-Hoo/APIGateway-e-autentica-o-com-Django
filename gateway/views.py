# views.py / router.py (SIMPLIFICADO)

from django.http import JsonResponse
import json
# Importe apenas os módulos de API necessários
from .services import material_api 

# Removido: cache, hashlib, CACHE_TIMEOUT

def gateway_router(request, service_name, endpoint_key):
    
    # 1. Delegar para service
    resp = None
    
    if service_name == 'material' and endpoint_key == 'grupo_material':
        resp = material_api.consultar_grupo_material(params=request.GET)
        
    else:
        # Se o serviço ou endpoint não for encontrado
        return JsonResponse({'error': f'Serviço "{service_name}" ou endpoint "{endpoint_key}" não encontrado'}, status=404)

    # 2. Tratar Resposta
    if 'content' in resp:
        # Se a resposta for bem-sucedida, retorna o JSON (JsonResponse cuida da serialização e do Content-Type)
        return JsonResponse(resp['content'], status=resp['status'])
    
    else:
        # Se houver um erro no serviço (como 503 da API externa)
        # Retorna o erro com o status code apropriado
        return JsonResponse({'error': resp.get('error', 'Erro desconhecido')}, status=resp.get('status', 500))

# Removido: toda a lógica de cache e HttpResponse