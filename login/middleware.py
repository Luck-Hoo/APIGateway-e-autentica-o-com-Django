import time
from django.conf import settings
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse

class SessionTimeoutMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response
        # Obtém o tempo limite de segurança do settings, com fallback para 1 hora
        self.timeout = getattr(settings, 'SESSION_SECURITY_TIMEOUT', 3600)
        # URL de login para onde o usuário será redirecionado após o logout
        self.login_url = getattr(settings, 'LOGIN_URL', '/login/')
    
    

    def __call__(self, request):
        self.excluded_urls = [
            self.login_url,  # Exclui a própria página de login (evita loop)
            reverse('admin:index'), # Exclui a área de administração
            '/' # Opcional: Se sua homepage for pública
        ]
        # O middleware só deve ser aplicado a usuários autenticados
        if request.user.is_authenticated:
            # Ignora requisições POST para evitar interferir em submissões de formulário
            if request.method == 'POST':
                return self.get_response(request)
            if request.path in self.excluded_urls:
                return self.get_response(request)

            # Obtém o timestamp do último login registrado na sessão
            last_login = request.session.get('last_login_time')

            # Verifica se o timestamp existe
            if last_login:
                elapsed_time = time.time() - last_login
                
                # Verifica se o tempo decorrido excedeu o limite de segurança
                if elapsed_time > self.timeout:
                    # Faz logout e redireciona
                    logout(request)
                    
                    # Redireciona para a tela de login
                    return redirect(self.login_url)
            
            # 4. Atualiza o timestamp para estender a sessão se a requisição não expirou
            # O timeout é baseado no tempo desde o último acesso (início da sessão)
            request.session['last_login_time'] = time.time()
            
        # Continua o processamento normal da requisição
        response = self.get_response(request)
        return response