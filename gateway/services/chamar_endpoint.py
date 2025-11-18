import requests
import json
import time
from urllib.parse import urljoin
from requests.exceptions import HTTPError, RequestException

# Importa as constantes de configuração (Base URL, Retries, etc.)
from .gateway_config import API_BASE_URL, MAX_RETRIES, RETRY_STATUSES, REQUEST_TIMEOUT


class ExternalAPIClient:
    """
    Cliente para fazer chamadas HTTP à API externa, implementando retry e tratamento de erros.
    Usa uma sessão requests para melhor performance em múltiplas chamadas.
    """
    def __init__(self):
        # Usar uma Session é recomendado para manter conexões ativas (pooling)
        self.session = requests.Session()
        self.max_retries = MAX_RETRIES
        self.retry_statuses = RETRY_STATUSES
        self.base_url = API_BASE_URL
        self.timeout = REQUEST_TIMEOUT

    def _format_error_response(self, status_code, default_message, resp=None):
        """Formata a resposta de erro extraindo detalhes se possível."""
        error_msg = default_message
        
        # Tenta extrair a mensagem de erro do JSON da resposta
        if resp is not None:
            try:
                error_details = resp.json()
                error_msg = error_details.get('error', error_details.get('message', error_msg))
            except:
                # Se falhar ao decodificar JSON, ignora e usa a mensagem padrão
                pass 
                
        return {
            'error': error_msg,
            'status': status_code,
        }

    def chamar_endpoint(self, endpoint_path, params=None):
        """
        Faz uma requisição GET ao endpoint externo com lógica de retry.
        :param endpoint_path: O caminho relativo do endpoint (ex: 'material/grupo/').
        :param params: Dicionário de parâmetros de query.
        :return: Dicionário com 'content' (sucesso) ou 'error' (falha).
        """
        if not self.base_url:
            return self._format_error_response(500, 'URL Base da API Externa (COMPRAS_BASE_URL) não configurada.')
            
        url = urljoin(self.base_url, endpoint_path)
        
        for attempt in range(self.max_retries):
            try:
                # 1. Tentar a Requisição
                resp = self.session.get(url, params=params, timeout=self.timeout)
                
                # 2. Verificar Status para Retry (500, 503, 504)
                if resp.status_code in self.retry_statuses:
                    if attempt < self.max_retries - 1:
                        wait_time = 2 ** attempt
                        print(f"Tentativa {attempt + 1} falhou com {resp.status_code}. Aguardando {wait_time}s para repetir. URL: {url}")
                        time.sleep(wait_time)
                        continue
                    # Se for a última tentativa, o fluxo segue para raise_for_status
                
                # 3. Tratar Erros HTTP Imediatamente (4xx ou 5xx não-retry)
                # Se a requisição falhou (ex: 404, 401), isto levanta um HTTPError
                resp.raise_for_status() 
                
                # 4. Tentar Decodificar JSON (Sucesso)
                try:
                    content = resp.json()
                except json.JSONDecodeError:
                    # Falha: API respondeu com sucesso (2xx), mas o conteúdo não é JSON
                    return self._format_error_response(502, 'API Externa retornou formato inválido (Não é JSON).', resp)
                
                # Sucesso: Retorna o conteúdo e status
                return {
                    'content': content,
                    'status': resp.status_code,
                }
            
            except HTTPError as e:
                # Captura erros 4xx ou falhas de 5xx após o último retry
                status_code = resp.status_code
                
                if status_code in self.retry_statuses and attempt == self.max_retries - 1:
                    error_msg = f'Falha após {self.max_retries} tentativas de retry. Status final: {status_code}'
                else:
                    error_msg = f'Erro HTTP {status_code}. Não foi possível processar a requisição.'
                
                return self._format_error_response(status_code, error_msg, resp)

            except RequestException as e:
                # 5. Erros de Conexão, Timeout ou DNS (Retry)
                if attempt < self.max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Tentativa {attempt + 1} falhou com erro de conexão/timeout: {e}. Aguardando {wait_time}s para repetir. URL: {url}")
                    time.sleep(wait_time)
                    continue
                
                # Última tentativa falhou: retorna o erro
                return self._format_error_response(503, f'Erro de conexão/timeout após {self.max_retries} tentativas: {e}')
            except Exception as e:
                return self._format_error_response(500, f'Erro inesperado: {str(e)}')


        # Fallback de segurança
        return self._format_error_response(500, 'Falha total na comunicação (erro lógico interno).')

# Instância única do cliente para ser usada pelas views
api_client = ExternalAPIClient()