/**
 * Função genérica para chamar qualquer endpoint do Gateway API.
 * @param {string} endpointKey - Chave curta do endpoint (ex: 'grupo', 'consultar_contratacoes').
 * @param {Object} params - Parâmetros de query da API.
 * @returns {Promise<Object>} - Retorna os dados brutos ou um objeto de erro.
 */
export async function fetchGatewayEndpoint(serviceName, endpointKey, params) {

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