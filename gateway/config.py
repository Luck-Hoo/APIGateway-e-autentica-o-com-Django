from decouple import config

SERVICE_TREE = {
    "compras": {
        "base_url": config("COMPRAS_BASE_URL", default="https://compras.dados.gov.br"),
        "endpoints": {
            # Dados Abertos Compras.gov.br
            "orgaos": "/api/orgaos/v1/orgaos.json",
            "uasgs": "/api/uasgs/v1/uasgs.json",
            "licitacoes": "/api/licitacoes/v1/licitacoes.json",
            "contratos": "/api/contratos/v1/contratos.json",
            "fornecedores": "/api/fornecedores/v1/fornecedores.json",
        }
    }
}
