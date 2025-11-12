from django.http import JsonResponse
import json
from .services import chamar_endpoint 
import os

# 🔑 Carrega os endpoints das variáveis de ambiente
MATERIAL_ENDPOINTS = {
    # Catálogo Material
    'grupo_material': os.environ.get('MATERIAL_GRUPO_ENDPOINT'), 
    'classe_material': os.environ.get('MATERIAL_CLASSE_ENDPOINT'), 
    'pdm_material': os.environ.get('MATERIAL_PDM_ENDPOINT'), 
    'item_material': os.environ.get('MATERIAL_ITEM_ENDPOINT'), 
    'natureza_despesa': os.environ.get('MATERIAL_NATUREZA_DESPESA_ENDPOINT'), 
    'unidade_fornecimento': os.environ.get('MATERIAL_UNIDADE_FORNECIMENTO_ENDPOINT'), 
    'caracteristicas': os.environ.get('MATERIAL_CARACTERISTICAS_ENDPOINT'),
}


def gateway_router(request, service_name, endpoint_key):
    
    # Delegar para service
    resp = None
    
    # Para os endpoints do material
    if service_name == 'material':
        endpoint_path = MATERIAL_ENDPOINTS.get(endpoint_key)
        
        if endpoint_path:
            # Chama a função genérica passando o caminho específico
            resp = chamar_endpoint.chamar_enpoint_dados_abertos_gov(endpoint_path, params=request.GET)
        else:
            return JsonResponse({
                'error': f'Endpoint "{endpoint_key}" não encontrado para o serviço "material".'
            }, status=404)

    # 2. Tratar Resposta
    if 'content' in resp:
        # Se a resposta for bem-sucedida, retorna o JSON (JsonResponse cuida da serialização e do Content-Type)
        return JsonResponse(resp['content'], status=resp['status'])
    
    else:
        # Se houver um erro no serviço (como 503 da API externa)
        # Retorna o erro com o status code apropriado
        return JsonResponse({'error': resp.get('error', 'Erro desconhecido')}, status=resp.get('status', 500))
