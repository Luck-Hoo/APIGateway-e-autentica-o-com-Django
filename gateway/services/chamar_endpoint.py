import requests
import json
import os
import time  # Importe a biblioteca time
from urllib.parse import urljoin

API_BASE_URL = os.environ.get('COMPRAS_BASE_URL')
MAX_RETRIES = 3  # Número máximo de tentativas
RETRY_STATUSES = [500, 503, 504] # Códigos de erro que indicam falha temporária

def chamar_enpoint_dados_abertos_gov(endpoint_path, params=None):
    url = urljoin(API_BASE_URL, endpoint_path)
    
    for attempt in range(MAX_RETRIES):
        try:
            # 1. Tentar a Requisição
            # Aumente o timeout, já que a API externa tem um timeout de 30s.
            # Vamos usar 60s para a requisição, dando tempo para ela tentar e falhar.
            resp = requests.get(url, params=params, timeout=60)
            
            # 2. Verificar Status para Retry
            if resp.status_code in RETRY_STATUSES:
                # Se for um erro temporário e não for a última tentativa
                if attempt < MAX_RETRIES - 1:
                    wait_time = 2 ** attempt  # Backoff: 1s, 2s, 4s
                    print(f"Tentativa {attempt + 1} falhou com {resp.status_code}. Aguardando {wait_time}s para repetir.")
                    time.sleep(wait_time)
                    continue  # Pula para a próxima iteração do loop (próxima tentativa)
            
            # 3. Tratar Respostas de Sucesso ou Erro Fatal (fora do retry)
            resp.raise_for_status() 
            
            # Adicionar tratamento de JSONDecodeError
            try:
                content = resp.json()
            except json.JSONDecodeError:
                return {
                    'error': 'API Externa retornou formato inválido (Não é JSON).',
                    'status': 502, 
                }
                
            # Sucesso: Sai da função
            return {
                'content': content,
                'status': resp.status_code,
            }
            
        except requests.RequestException as e:
            # Erros de conexão ou timeout do cliente
            if attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                print(f"Tentativa {attempt + 1} falhou com erro de conexão: {e}. Aguardando {wait_time}s para repetir.")
                time.sleep(wait_time)
                continue
            
            # Se for a última tentativa, retorna o erro
            return {
                'error': f'Serviço indisponível ou erro na requisição após {MAX_RETRIES} tentativas: {e}',
                'status': 503
            }
            
    # Caso todas as tentativas falhem, o último 'return' de erro será executado
    return {
        'error': f'Falha total na comunicação após {MAX_RETRIES} tentativas.',
        'status': 503
    }