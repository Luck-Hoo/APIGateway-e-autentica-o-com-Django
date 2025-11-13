// api_gateway.js: Módulo para gerenciar a comunicação com o Gateway Django.

/**
 * Função genérica para chamar qualquer endpoint do Gateway API.
 * * @param {string} serviceName - Nome do serviço no roteador Django (ex: 'material', 'contratacoes').
 * @param {string} endpointKey - Chave curta do endpoint (ex: 'grupo', 'consultar_contratacoes').
 * @param {Object} params - Parâmetros de query da API.
 * @returns {Promise<Object>} - Retorna os dados brutos ou um objeto de erro.
 */
export async function fetchGatewayEndpoint(serviceName, endpointKey, params) {
    const query = new URLSearchParams(params).toString();
    // A URL deve seguir o formato /gateway/SERVICE_NAME/ENDPOINT_KEY/?query
    const url = `/gateway/${serviceName}/${endpointKey}/?${query}`;

    const res = await fetch(url);
    const data = await res.json().catch(() => ({ error: 'Resposta não é um JSON válido.' }));

    if (!res.ok) {
        const errorMessage = data.error || `Erro HTTP ${res.status} ao acessar ${endpointKey}.`;
        return { error: errorMessage };
    }
    
    // Retorna o objeto de resposta completo (incluindo 'resultado', 'pagination', etc.)
    return data;
}


/**
 * Preenche um dropdown SELECT com dados de uma API, formatando o texto.
 */
export async function populateSelect(selectElement, serviceName, endpointKey, codeKey, nameKey, defaultText, filterCode = null) {
    selectElement.innerHTML = `<option value="" selected>${defaultText}</option>`;
    selectElement.disabled = true;

    if (endpointKey === 'classe' && !filterCode) {
        selectElement.innerHTML = '<option value="" selected>Selecione um Grupo primeiro</option>';
        return;
    }

    try {
        const params = { pagina: 1 };

        // Parâmetros específicos por endpoint
        if (endpointKey === 'grupo') {
            params.statusGrupo = 'true';
        } else if (endpointKey === 'classe') {
            params.codigoGrupo = filterCode;
        }
        
        // Chamada à função fetchGatewayEndpoint
        const data = await fetchGatewayEndpoint(serviceName, endpointKey, params);

        if (data.error) {
            throw new Error(data.error);
        }

        const list = data.resultado || data.content?.resultado || [];

        if (list.length === 0) {
            selectElement.innerHTML = `<option value="">Nenhum item encontrado</option>`;
            selectElement.disabled = true;
            return;
        }

        selectElement.innerHTML = `<option value="" selected>Selecione um...</option>`;

        list.forEach(item => {
            const option = document.createElement('option');
            option.value = item[codeKey];
            option.textContent = `${item[codeKey]} - ${item[nameKey]}` || item[codeKey];
            selectElement.appendChild(option);
        });

        selectElement.disabled = false;

    } catch (err) {
        console.error(`Erro ao carregar ${endpointKey}:`, err);
        selectElement.innerHTML = `<option value="">Falha ao carregar: ${err.message}</option>`;
        selectElement.disabled = true;
    }
}