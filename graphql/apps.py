from django.apps import AppConfig


class GrapqlConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'graphql'
    
    label = 'grapql' #Antigo nome app