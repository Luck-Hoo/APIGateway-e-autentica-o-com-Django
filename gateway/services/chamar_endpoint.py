import requests
import json
import os
import time
from urllib.parse import urljoin
from requests.exceptions import HTTPError # Importação adicional necessária para tratar 4xx/5xx

API_BASE_URL = os.environ.get('COMPRAS_BASE_URL')
MAX_RETRIES = 3 
RETRY_STATUSES = [500, 503, 504] 

def chamar_enpoint_dados_abertos_gov(endpoint_path, params=None):
    url = urljoin(API_BASE_URL, endpoint_path)
    
    # Este laço agora garante que apenas erros de rede ou status de retry causam repetição
    for attempt in range(MAX_RETRIES):
        try:
            # 1. Tentar a Requisição
            resp = requests.get(url, params=params, timeout=30)
            
            # 2. Verificar Status para Retry (500, 503, 504)
            if resp.status_code in RETRY_STATUSES:
                if attempt < MAX_RETRIES - 1:
                    wait_time = 2 ** attempt
                    print(f"Tentativa {attempt + 1} falhou com {resp.status_code}. Aguardando {wait_time}s para repetir.")
                    time.sleep(wait_time)
                    continue
                # Se for a última tentativa e falhar, o código sairá do 'try' para o 'except HTTPError'
            
            # 3. Tratar Erros HTTP Imediatamente (4xx ou 5xx não retry)
            # Se a requisição falhou (ex: 404), isto levanta um HTTPError
            resp.raise_for_status() 
            
            # 4. Tentar Decodificar JSON (Sucesso)
            try:
                content = resp.json()
            except json.JSONDecodeError:
                # Falha: API respondeu com sucesso, mas o conteúdo não é JSON
                return {
                    'error': 'API Externa retornou formato inválido (Não é JSON).',
                    'status': 502, 
                }
                
            # Sucesso: Sai do laço e da função
            return {
                'content': content,
                'status': resp.status_code,
            }
        
        except HTTPError as e:
            # Captura erros 4xx (404, 401, etc.) ou 5xx (se não estava na lista de retry)
            status_code = resp.status_code
            
            # Se for um status de retry na última tentativa, formatamos a mensagem de erro
            if status_code in RETRY_STATUSES and attempt == MAX_RETRIES - 1:
                error_msg = f'Falha após {MAX_RETRIES} tentativas. Status final: {status_code}'
            else:
                error_msg = f'Erro HTTP {status_code}. Não foi possível processar a requisição.'
            
            # Tenta extrair a mensagem de erro da resposta (se houver)
            try:
                error_details = resp.json()
                error_msg = error_details.get('error', error_details.get('message', error_msg))
            except:
                pass # Ignora falha de JSON e usa a mensagem padrão
                
            return {
                'error': error_msg,
                'status': status_code,
            }

        except requests.RequestException as e:
            # 5. Erros de Conexão ou Timeout (Retry)
            if attempt < MAX_RETRIES - 1:
                wait_time = 2 ** attempt
                print(f"Tentativa {attempt + 1} falhou com erro de conexão/timeout: {e}. Aguardando {wait_time}s para repetir.")
                time.sleep(wait_time)
                continue
            
            # Última tentativa falhou: retorna o erro
            return {
                'error': f'Erro de conexão/timeout após {MAX_RETRIES} tentativas: {e}',
                'status': 503
            }

    # Esta linha é um fallback de segurança e teoricamente nunca deve ser alcançada se o laço for
    # bem estruturado, mas é bom mantê-lo por segurança.
    return {
        'error': f'Falha total na comunicação (falha lógica de código).',
        'status': 500
    }