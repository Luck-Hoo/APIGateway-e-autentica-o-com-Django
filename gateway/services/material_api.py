# material_api.py (A estrutura de retorno é mantida)
import requests
import json 

API_BASE_URL = "https://dadosabertos.compras.gov.br"

def consultar_grupo_material(params=None):
    url = f"{API_BASE_URL}/modulo-material/1_consultarGrupoMaterial"
    try:
        resp = requests.get(url, params=params, timeout=30)
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