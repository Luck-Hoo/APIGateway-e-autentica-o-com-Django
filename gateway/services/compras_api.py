import requests

def get_orgaos(params=None):
    url = "https://api.compras.gov.br/v1/orgaos"
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        return {
            'content': resp.json(),
            'status': resp.status_code,
            'content_type': resp.headers.get('Content-Type', 'application/json')
        }
    except requests.RequestException:
        return {
            'error': 'Serviço indisponível',
            'status': 503
        }
