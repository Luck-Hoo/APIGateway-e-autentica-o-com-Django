/**
 * Função genérica para chamar qualquer endpoint do Gateway API.
 * Utiliza o padrão de Objeto de Configuração para os metadados do endpoint.
 * * @param {object} metadata - Objeto contendo as chaves de serviço e endpoint.
 * @param {string} metadata.serviceName - Nome do serviço (ex: 'material', 'contratacoes').
 * @param {string} metadata.endpointKey - Chave curta do endpoint (ex: 'grupo', 'consultar_contratacoes').
 * @param {Object} params - Parâmetros de query da API (ex: { codigoGrupo: 123, pagina: 1 }).
 * @returns {Promise<Object>} - Retorna um objeto com a chave do endpoint e os dados/erro.
 */
export async function fetchGatewayEndpoint(
    { serviceName, endpointKey } 
    , params
) {

    const query = new URLSearchParams(params).toString();
    const url = `/gateway/${serviceName}/${endpointKey}/?${query}`;

    const res = await fetch(url);

    if (!res.ok) {
        try {
            const errorData = await res.json();
            const errorMessage = errorData.error || `Erro HTTP ${res.status}`;
            return { [endpointKey]: { error: errorMessage } };
        } catch {
            return { [endpointKey]: { error: `Falha ao conectar/HTTP ${res.status}` } };
        }
    }

    const data = await res.json();
    return { [endpointKey]: data };
}