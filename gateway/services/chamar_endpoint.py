# material_api.py (A estrutura de retorno é mantida)
import requests
import json
import os
from urllib.parse import urljoin

API_BASE_URL = os.environ.get(
    'COMPRAS_BASE_URL'
)

def chamar_enpoint_dados_abertos_gov(endpoint_path, params=None):
    url = urljoin(API_BASE_URL, endpoint_path)    
    try:
        resp = requests.get(url, params=params, timeout=60)
        resp.raise_for_status()
        
        # 🔑 Adicionar tratamento de JSONDecodeError para evitar erros 500
        try:
            content = resp.json()
        except json.JSONDecodeError:
            return {
                'error': 'API Externa retornou formato inválido (Não é JSON).',
                'status': 502, 
            }
            
        return {
            'content': content,
            'status': resp.status_code,
        }
    except requests.RequestException as e:
        return {
            'error': f'Serviço indisponível ou erro na requisição: {e}',
            'status': 503
        }