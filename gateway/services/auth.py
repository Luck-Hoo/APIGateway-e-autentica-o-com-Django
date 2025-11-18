# services/auth.py
import jwt
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

#JWT_PUBLIC_KEY = settings.JWT_PUBLIC_KEY
JWT_ALGORITHM = "RS256"
JWT_ISSUER = "https://meu-auth-service"
JWT_AUDIENCE = "compras-gateway"

def require_jwt(request):
    token = request.headers.get("Authorization")

    if not token:
        raise AuthenticationFailed("Token não informado.")

    if token.startswith("Bearer "):
        token = token[7:]

    try:
        payload = jwt.decode(
            token,
            #JWT_PUBLIC_KEY,          # <<< Usa a chave pública
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token expirado.")
    except jwt.InvalidAudienceError:
        raise AuthenticationFailed("Audience inválida.")
    except jwt.InvalidIssuerError:
        raise AuthenticationFailed("Issuer inválido.")
    except jwt.PyJWTError:
        raise AuthenticationFailed("Token inválido.")
