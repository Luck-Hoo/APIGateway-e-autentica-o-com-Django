# services/cache.py
import time
import hashlib
import json

CACHE_TTL = 30
_cache = {}

def _key(url, params):
    raw = url + json.dumps(params, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()

def cache_get(url, params):
    key = _key(url, params)
    item = _cache.get(key)

    if not item:
        return None

    value, expires = item
    if expires < time.time():
        del _cache[key]
        return None

    return value

def cache_set(url, params, response):
    key = _key(url, params)
    _cache[key] = (response, time.time() + CACHE_TTL)
