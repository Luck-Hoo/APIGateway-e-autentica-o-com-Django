from django.http import JsonResponse
import json
from .services import chamar_endpoint 
import os

# ======================================================================
# 01 - CATÁLOGO - MATERIAL
# ======================================================================
MATERIAL_ENDPOINTS = {
    'grupo': os.environ.get('MATERIAL_GRUPO_ENDPOINT'),
    'classe': os.environ.get('MATERIAL_CLASSE_ENDPOINT'),
    'pdm': os.environ.get('MATERIAL_PDM_ENDPOINT'),
    'item': os.environ.get('MATERIAL_ITEM_ENDPOINT'),
    'natureza_despesa': os.environ.get('MATERIAL_NATUREZA_DESPESA_ENDPOINT'),
    'unidade_fornecimento': os.environ.get('MATERIAL_UNIDADE_FORNECIMENTO_ENDPOINT'),
    'caracteristicas': os.environ.get('MATERIAL_CARACTERISTICAS_ENDPOINT'),
}

# ======================================================================
# 02 - CATÁLOGO - SERVIÇO
# ======================================================================
SERVICO_ENDPOINTS = {
    'secao': os.environ.get('SERVICO_SECAO_ENDPOINT'),
    'divisao': os.environ.get('SERVICO_DIVISAO_ENDPOINT'),
    'grupo': os.environ.get('SERVICO_GRUPO_ENDPOINT'),
    'classe': os.environ.get('SERVICO_CLASSE_ENDPOINT'),
    'subclasse': os.environ.get('SERVICO_SUBCLASSE_ENDPOINT'),
    'item': os.environ.get('SERVICO_ITEM_ENDPOINT'),
    'unidade_medida': os.environ.get('SERVICO_UNIDADE_MEDIDA_ENDPOINT'),
    'natureza_despesa': os.environ.get('SERVICO_NATUREZA_DESPESA_ENDPOINT'),
}

# ======================================================================
# 03 - PESQUISA DE PREÇO
# ======================================================================
PRECO_ENDPOINTS = {
    'material': os.environ.get('PRECO_MATERIAL_ENDPOINT'),
    'material_csv': os.environ.get('PRECO_MATERIAL_CSV_ENDPOINT'),
    'material_detalhe': os.environ.get('PRECO_MATERIAL_DETALHE_ENDPOINT'),
    'material_detalhe_csv': os.environ.get('PRECO_MATERIAL_DETALHE_CSV_ENDPOINT'),
    'servico': os.environ.get('PRECO_SERVICO_ENDPOINT'),
    'servico_csv': os.environ.get('PRECO_SERVICO_CSV_ENDPOINT'),
    'servico_detalhe': os.environ.get('PRECO_SERVICO_DETALHE_ENDPOINT'),
    'servico_detalhe_csv': os.environ.get('PRECO_SERVICO_DETALHE_CSV_ENDPOINT'),
}

# ======================================================================
# 04 - PGC (Plano Geral de Contratações)
# ======================================================================
PGC_ENDPOINTS = {
    'detalhe': os.environ.get('PGC_DETALHE_ENDPOINT'),
    'detalhe_csv': os.environ.get('PGC_DETALHE_CSV_ENDPOINT'),
    'catalogo': os.environ.get('PGC_DETALHE_CATALOGO_ENDPOINT'),
    'catalogo_csv': os.environ.get('PGC_DETALHE_CATALOGO_CSV_ENDPOINT'),
    'agregacao': os.environ.get('PGC_AGREGACAO_ENDPOINT'),
    'agregacao_csv': os.environ.get('PGC_AGREGACAO_CSV_ENDPOINT'),
}

# ======================================================================
# 05 - UASG
# ======================================================================
UASG_ENDPOINTS = {
    'consultar': os.environ.get('UASG_CONSULTAR_ENDPOINT'),
    'consultar_csv': os.environ.get('UASG_CONSULTAR_CSV_ENDPOINT'),
    'orgao': os.environ.get('UASG_ORGAO_ENDPOINT'),
    'orgao_csv': os.environ.get('UASG_ORGAO_CSV_ENDPOINT'),
}

# ======================================================================
# 06 - LEGADO
# ======================================================================
LEGADO_ENDPOINTS = {
    'licitacao': os.environ.get('LEGADO_LICITACAO_ENDPOINT'),
    'licitacao_id': os.environ.get('LEGADO_LICITACAO_ID_ENDPOINT'),
    'item_licitacao': os.environ.get('LEGADO_ITEM_LICITACAO_ENDPOINT'),
    'item_licitacao_id': os.environ.get('LEGADO_ITEM_LICITACAO_ID_ENDPOINT'),
    'pregoes': os.environ.get('LEGADO_PREGOES_ENDPOINT'),
    'pregoes_id': os.environ.get('LEGADO_PREGOES_ID_ENDPOINT'),
    'itens_pregoes': os.environ.get('LEGADO_ITENS_PREGOES_ENDPOINT'),
    'itens_pregoes_id': os.environ.get('LEGADO_ITENS_PREGOES_ID_ENDPOINT'),
    'compras_sem_licitacao': os.environ.get('LEGADO_COMPRAS_SEM_LICITACAO_ENDPOINT'),
    'compra_sem_licitacao_id': os.environ.get('LEGADO_COMPRA_SEM_LICITACAO_ID_ENDPOINT'),
    'compra_itens_sem_licitacao': os.environ.get('LEGADO_COMPRA_ITENS_SEM_LICITACAO_ENDPOINT'),
    'itens_compra_sem_licitacao_id': os.environ.get('LEGADO_ITENS_COMPRAS_SEM_LICITACAO_ID_ENDPOINT'),
    'rdc': os.environ.get('LEGADO_RDC_ENDPOINT'),
}

# ======================================================================
# 07 - CONTRATAÇÕES (PNCP 14133)
# ======================================================================
CONTRATACOES_ENDPOINTS = {
    # Corrigindo o nome da variável de ambiente para ser mais consistente com o env
    'consultar_contratacoes': os.environ.get('CONTRATACOES_PNCP_ENDPOINT'), 
    'consultar_contratacoes_id': os.environ.get('CONTRATACOES_PNCP_ID_ENDPOINT'),
    'consultar_itens': os.environ.get('CONTRATACOES_ITENS_PNCP_ENDPOINT'),
    'consultar_itens_id': os.environ.get('CONTRATACOES_ITENS_PNCP_ID_ENDPOINT'),
    'consultar_resultado': os.environ.get('CONTRATACOES_RESULTADO_ITENS_PNCP_ENDPOINT'),
    'consultar_resultado_id': os.environ.get('CONTRATACOES_RESULTADO_ITENS_PNCP_ID_ENDPOINT'),
}

# ======================================================================
# 08 - ARP - ATA DE REGISTRO DE PREÇOS
# ======================================================================
ARP_ENDPOINTS = {
    'consultar': os.environ.get('ARP_CONSULTAR_ENDPOINT'),
    'consultar_id': os.environ.get('ARP_CONSULTAR_ID_ENDPOINT'),
    'item': os.environ.get('ARP_ITEM_ENDPOINT'),
    'item_id': os.environ.get('ARP_ITEM_ID_ENDPOINT'),
}

# ======================================================================
# 09 - CONTRATOS
# ======================================================================
CONTRATOS_ENDPOINTS = {
    'consultar': os.environ.get('CONTRATOS_CONSULTAR_ENDPOINT'),
    'consultar_id': os.environ.get('CONTRATOS_CONSULTAR_ID_ENDPOINT'),
    'item': os.environ.get('CONTRATOS_ITEM_ENDPOINT'),
    'item_id': os.environ.get('CONTRATOS_ITEM_ID_ENDPOINT'),
}

# ======================================================================
# 10 - FORNECEDOR
# ======================================================================
FORNECEDOR_ENDPOINTS = {
    'consultar': os.environ.get('FORNECEDOR_CONSULTAR_ENDPOINT'),
}

# ======================================================================
# 11 - OCDS
# ======================================================================
OCDS_ENDPOINTS = {
    'releases': os.environ.get('OCDS_RELEASES_ENDPOINT'),
}

# ======================================================================
# DICIONÁRIO MESTRE DE TODOS OS SERVIÇOS (Para uso no gateway_router)
# ======================================================================

ALL_SERVICES = {
    'material': MATERIAL_ENDPOINTS,
    'servico': SERVICO_ENDPOINTS,
    'preco': PRECO_ENDPOINTS,
    'pgc': PGC_ENDPOINTS,
    'uasg': UASG_ENDPOINTS,
    'legado': LEGADO_ENDPOINTS,
    'contratacoes': CONTRATACOES_ENDPOINTS,
    'arp': ARP_ENDPOINTS,
    'contratos': CONTRATOS_ENDPOINTS,
    'fornecedor': FORNECEDOR_ENDPOINTS,
    'ocds': OCDS_ENDPOINTS,
}


# gateway/views.py (Função Atualizada)

def gateway_router(request, service_name, endpoint_key):
    
    # 1. Encontrar o dicionário de endpoints do serviço
    endpoint_group = ALL_SERVICES.get(service_name)
    
    if not endpoint_group:
        return JsonResponse({'error': f'Serviço "{service_name}" não reconhecido.'}, status=404)

    # 2. Encontrar o endpoint_path específico
    endpoint_path = endpoint_group.get(endpoint_key)
    
    # Esta verificação substitui o problema anterior (endpoint não encontrado no grupo)
    if not endpoint_path:
        return JsonResponse({
            'error': f'Endpoint "{endpoint_key}" não encontrado para o serviço "{service_name}".'
        }, status=404)

    # 3. Chamar o serviço
    resp = chamar_endpoint.chamar_enpoint_dados_abertos_gov(endpoint_path, params=request.GET)
    
    # 4. Tratar Resposta (incluindo a verificação de None)
    if resp is None:
        return JsonResponse({
            'error': 'Falha na comunicação com a API externa. O serviço retornou nulo.'
        }, status=503)

    if 'content' in resp:
        # Se a resposta for bem-sucedida, retorna o JSON
        return JsonResponse(resp['content'], status=resp.get('status', 200))
    
    else:
        # Se houver um erro no serviço
        return JsonResponse(
            {'error': resp.get('error', 'Erro desconhecido')},
            status=resp.get('status', 500)
        )