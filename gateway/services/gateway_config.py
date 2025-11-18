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
# Base URL para a API Externa
API_BASE_URL = os.environ.get('COMPRAS_BASE_URL')

# Configurações de Retry
MAX_RETRIES = 3 
RETRY_STATUSES = [500, 503, 504]
# O TIMEOUT é importante e será passado para o cliente HTTP
REQUEST_TIMEOUT = 30 # segundos