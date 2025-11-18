# services/rate_limit.py
import time
from rest_framework.exceptions import Throttled

RATE_LIMIT = 20
WINDOW = 10
clients = {}

def rate_limit(client_id):
    now = time.time()

    reqs = clients.get(client_id, [])
    reqs = [t for t in reqs if now - t < WINDOW]

    if len(reqs) >= RATE_LIMIT:
        raise Throttled(detail="Muitas requisições. Aguarde alguns segundos.")

    reqs.append(now)
    clients[client_id] = reqs
