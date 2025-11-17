import { populateSelect } from './dropdown.js';
import { fetchGatewayEndpoint } from './api_gateway.js';

// --- CONFIGURAÇÕES GLOBAIS ---

const SERVICE_NAME = 'material';
const ENDPOINT_KEYS_FOR_SEARCH = [
    'grupo', // Usado para obter o nome do grupo selecionado no filtro
    'classe',
    'pdm',
    'item',
    'natureza_despesa',
    'unidade_fornecimento',
    'caracteristicas'
];

// --- VARIÁVEIS DOM ---

const statusMessageDiv = document.getElementById('status-message');
const tableDiv = document.getElementById('material-data-table');
const tableBody = document.getElementById('table-body');
const searchButton = document.getElementById('search-btn');

// Selects para filtros
const nomeGrupoSelect = document.getElementById('nomeGrupo-select');
const classeSelect = document.getElementById('classe-select');
const pdmSelect = document.getElementById('pdm-select');
const itemSelect = document.getElementById('item-select');
const naturezaDespesaSelect = document.getElementById('naturezaDespesa-select');
const unidadeFornecimentoSelect = document.getElementById('unidadeFornecimento-select');
const caracteristicasSelect = document.getElementById('caracteristicas-select');

// Lista de selects dependentes para reset
const DEPENDENT_SELECTS = [
    classeSelect,
    pdmSelect,
    itemSelect,
    naturezaDespesaSelect,
    unidadeFornecimentoSelect,
    caracteristicasSelect
];


// --- FUNÇÕES AUXILIARES ---

/**
 * Reseta o estado dos selects dependentes.
 * @param {HTMLSelectElement[]} selects - Array de elementos select a serem resetados.
 */
function resetSelects(selects) {
    selects.forEach(select => {
        // Usa o atributo data-default-message para manter o texto padrão
        const defaultMessage = select.getAttribute('data-default-message') || 'Selecione um...';
        select.innerHTML = `<option value="" selected>${defaultMessage}</option>`;
        select.disabled = true;
    });
    tableDiv.style.display = 'none';
    statusMessageDiv.innerHTML = '';
}

// --- CARREGAMENTO INICIAL ---

/**
 * Carrega o primeiro dropdown (Grupo) e configura mensagens padrão para os dependentes.
 */
async function loadDropdowns() {
    // 1. Configura as mensagens padrão (para quando o select for resetado)
    classeSelect.setAttribute('data-default-message', 'Selecione um Grupo primeiro');
    pdmSelect.setAttribute('data-default-message', 'Selecione uma Classe primeiro');
    itemSelect.setAttribute('data-default-message', 'Selecione um PDM primeiro');
    naturezaDespesaSelect.setAttribute('data-default-message', 'Selecione um PDM primeiro');
    unidadeFornecimentoSelect.setAttribute('data-default-message', 'Selecione um PDM primeiro');
    caracteristicasSelect.setAttribute('data-default-message', 'Selecione um Item primeiro');

    // 2. Carrega o dropdown inicial (GRUPO) usando o Padrão de Objeto de Configuração
    await populateSelect({
        selectElement: nomeGrupoSelect,
        serviceName: SERVICE_NAME,
        endpointKey: 'grupo',
        codeKey: 'codigoGrupo',
        nameKey: 'nomeGrupo',
        defaultText: 'Carregando Grupos...'
    });

    // 3. Reseta os selects dependentes
    resetSelects(DEPENDENT_SELECTS);
}

// --- LÓGICA DE RENDERIZAÇÃO E BUSCA ---

/**
 * Renderiza os dados consolidados na tabela.
 * @param {object} data - Objeto contendo os dados retornados de múltiplos endpoints.
 */
function renderTable(data) {
    const errors = Object.entries(data).filter(([, value]) => value && value.error);
    const classesList = data.classe?.resultado || [];

    if (errors.length > 0) {
        // Lógica de Erros
        const errorMessage = errors
            .map(([key, value]) => `**[${key.toUpperCase()}]:** ${value.error}`)
            .join('<br>');
        statusMessageDiv.innerHTML = `<p class="text-danger">Erros encontrados:<br>${errorMessage}</p>`;
        tableDiv.style.display = 'none';
        return;
    }

    if (classesList.length === 0) {
        // Lógica de Lista Vazia
        statusMessageDiv.innerHTML = '<p class="text-warning">Nenhum material encontrado para os filtros selecionados.</p>';
        tableBody.innerHTML = '';
        tableDiv.style.display = 'none';
        return;
    }

    // Lógica de Sucesso
    statusMessageDiv.innerHTML = `<p class="text-success">Dados consultados com sucesso! ${classesList.length} classes encontradas.</p>`;

    // Mapeamento de dados auxiliares para fácil acesso (Otimização da busca)
    const pdmMap = (data.pdm?.resultado || []).reduce((acc, item) => { acc[item.codigoPdm] = item; return acc; }, {});
    const itemMap = (data.item?.resultado || []).reduce((acc, item) => { acc[item.codigoItem] = item; return acc; }, {});
    const naturezaMap = (data.natureza_despesa?.resultado || []).reduce((acc, item) => { acc[item.codigoPdm] = item; return acc; }, {});
    const unidadeMap = (data.unidade_fornecimento?.resultado || []).reduce((acc, item) => { acc[item.codigoPdm] = item; return acc; }, {});
    const caracteristicasMap = (data.caracteristicas?.resultado || []).reduce((acc, item) => { acc[item.codigoItem] = item; return acc; }, {});


    tableBody.innerHTML = ''; // Limpa a tabela

    // Itera sobre o resultado principal (CLASSES)
    classesList.forEach(classeItem => {
        const codigoGrupo = classeItem.codigoGrupo || '';
        const nomeGrupo = nomeGrupoSelect.options[nomeGrupoSelect.selectedIndex]?.textContent.split(' - ')[1] || 'Grupo Selecionado';
        const codigoClasse = classeItem.codigoClasse || '';
        const nomeClasse = classeItem.nomeClasse || 'Não informado';

        // Determinação dos dados relacionados (baseado na lógica original)
        const pdmEncontrado = Object.values(pdmMap).find(pdm => pdm.codigoGrupo == codigoGrupo && pdm.codigoClasse == codigoClasse);
        const pdmInfo = pdmEncontrado ? `${pdmEncontrado.codigoPdm} - ${pdmEncontrado.nomePdm}` : 'N/A';

        const itemEncontrado = Object.values(itemMap).find(item => item.codigoPdm == pdmEncontrado?.codigoPdm);
        const itemInfo = itemEncontrado ? `${itemEncontrado.codigoItem} - ${itemEncontrado.descricaoItem}` : 'N/A';

        const naturezaEncontrada = Object.values(naturezaMap).find(nd => nd.codigoPdm == pdmEncontrado?.codigoPdm);
        const naturezaInfo = naturezaEncontrada ? `${naturezaEncontrada.codigoNaturezaDespesa} - ${naturezaEncontrada.nomeNaturezaDespesa}` : 'N/A';
        
        const unidadeEncontrada = Object.values(unidadeMap).find(uf => uf.codigoPdm == pdmEncontrado?.codigoPdm);
        const unidadeInfo = unidadeEncontrada ? `${unidadeEncontrada.siglaUnidadeFornecimento} - ${unidadeEncontrada.nomeUnidadeFornecimento}` : 'N/A';

        const caracteristicaEncontrada = Object.values(caracteristicasMap).find(carac => carac.codigoItem == itemEncontrado?.codigoItem);
        const caracteristicaInfo = caracteristicaEncontrada ? `${caracteristicaEncontrada.nomeCaracteristica}: ${caracteristicaEncontrada.nomeValorCaracteristica}` : 'N/A';
        
        // Renderização da linha
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${codigoGrupo} - ${nomeGrupo}</td>
            <td>${codigoClasse} - ${nomeClasse}</td>
            <td>${pdmInfo}</td>
            <td>${itemInfo}</td>
            <td>${naturezaInfo}</td>
            <td>${unidadeInfo}</td>
            <td>${caracteristicaInfo}</td>
        `;
    });

    tableDiv.style.display = 'block';
}

// --- EVENT LISTENERS (Lógica de Cascata) ---

// 1. Listener para carregar a Classe após selecionar o Grupo
nomeGrupoSelect.addEventListener('change', () => {
    const selectedGroupId = nomeGrupoSelect.value;
    resetSelects(DEPENDENT_SELECTS);

    if (selectedGroupId) {
        populateSelect({
            selectElement: classeSelect,
            serviceName: SERVICE_NAME,
            endpointKey: 'classe',
            codeKey: 'codigoClasse',
            nameKey: 'nomeClasse',
            defaultText: 'Carregando Classes...',
            filterCode: selectedGroupId, // Código do Grupo
            extraParams: { statusClasse: 1 } // Outros parâmetros específicos
        });
    }
});

// 2. Listener para carregar PDM após selecionar a Classe
classeSelect.addEventListener('change', () => {
    const selectedClassId = classeSelect.value;
    const selectedGroupId = nomeGrupoSelect.value;
    resetSelects([pdmSelect, itemSelect, naturezaDespesaSelect, unidadeFornecimentoSelect, caracteristicasSelect]);

    if (selectedClassId && selectedGroupId) {
        populateSelect({
            selectElement: pdmSelect,
            serviceName: SERVICE_NAME,
            endpointKey: 'pdm',
            codeKey: 'codigoPdm',
            nameKey: 'nomePdm',
            defaultText: 'Carregando PDMs...',
            filterCode: selectedGroupId, // Código do Grupo
            extraParams: { codigoClasse: selectedClassId, statusPdm: 1 }
        });
    }
});

// 3. Listener para carregar Item, Natureza Despesa e Unidade Fornecimento após selecionar o PDM
pdmSelect.addEventListener('change', () => {
    const selectedPdmId = pdmSelect.value;
    const selectedGroupId = nomeGrupoSelect.value;
    const selectedClassId = classeSelect.value;
    resetSelects([itemSelect, naturezaDespesaSelect, unidadeFornecimentoSelect, caracteristicasSelect]);

    if (selectedPdmId) {
        // Carrega ITEM
        populateSelect({
            selectElement: itemSelect,
            serviceName: SERVICE_NAME,
            endpointKey: 'item',
            codeKey: 'codigoItem',
            nameKey: 'descricaoItem',
            defaultText: 'Carregando Itens...',
            filterCode: selectedGroupId, // Código do Grupo (se o endpoint exigir)
            extraParams: { codigoClasse: selectedClassId, codigoPdm: selectedPdmId, statusItem: 1 }
        });
        
        // Carrega NATUREZA DESPESA
        populateSelect({
            selectElement: naturezaDespesaSelect,
            serviceName: SERVICE_NAME,
            endpointKey: 'natureza_despesa',
            codeKey: 'codigoNaturezaDespesa',
            nameKey: 'nomeNaturezaDespesa',
            defaultText: 'Carregando Naturezas...',
            extraParams: { codigoPdm: selectedPdmId, statusNaturezaDespesa: 1 } // Sem filterCode específico
        });

        // Carrega UNIDADE FORNECIMENTO
        populateSelect({
            selectElement: unidadeFornecimentoSelect,
            serviceName: SERVICE_NAME,
            endpointKey: 'unidade_fornecimento',
            codeKey: 'siglaUnidadeFornecimento',
            nameKey: 'nomeUnidadeFornecimento',
            defaultText: 'Carregando Unidades...',
            extraParams: { codigoPdm: selectedPdmId, statusUnidadeFornecimentoPdm: 1 } // Sem filterCode específico
        });
    }
});

// 4. Listener para carregar Características após selecionar o Item
itemSelect.addEventListener('change', () => {
    const selectedItemId = itemSelect.value;
    resetSelects([caracteristicasSelect]);

    if (selectedItemId) {
        populateSelect({
            selectElement: caracteristicasSelect,
            serviceName: SERVICE_NAME,
            endpointKey: 'caracteristicas',
            codeKey: 'codigoCaracteristica',
            nameKey: 'nomeCaracteristica',
            defaultText: 'Carregando Características...',
            extraParams: { codigoItem: selectedItemId } // Sem filterCode específico
        });
    }
});


// --- LÓGICA DE PESQUISA PRINCIPAL ---

searchButton.addEventListener('click', async function () {
    const codigoGrupo = nomeGrupoSelect.value;
    
    // Obter todos os valores selecionados (filtros)
    const codigoClasse = classeSelect.value;
    const codigoPdm = pdmSelect.value;
    const codigoItem = itemSelect.value;
    const codigoNaturezaDespesa = naturezaDespesaSelect.value;
    // siglaUnidadeFornecimento é o valor (value) de Unidade Fornecimento
    const siglaUnidadeFornecimento = unidadeFornecimentoSelect.value; 
    const codigoCaracteristica = caracteristicasSelect.value; 

    if (!codigoGrupo) {
        statusMessageDiv.innerHTML = '<p class="text-danger">O **Grupo** é obrigatório para a consulta.</p>';
        tableDiv.style.display = 'none';
        return;
    }

    statusMessageDiv.innerHTML = '<button class="btn btn-primary" type="button" disabled><span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span role="status"> Carregando...</span></button>';
    tableBody.innerHTML = '';
    tableDiv.style.display = 'none';

    try {
        const baseParams = {
            pagina: 1,
            codigoGrupo: codigoGrupo,
            // Adiciona filtros se existirem (Padrão de Propriedades Opcionais)
            ...(codigoClasse && { codigoClasse: codigoClasse, statusClasse: 1 }),
            ...(codigoPdm && { codigoPdm: codigoPdm, statusPdm: 1 }),
            ...(codigoItem && { codigoItem: codigoItem, statusItem: 1 }),
            ...(codigoNaturezaDespesa && { codigoNaturezaDespesa: codigoNaturezaDespesa, statusNaturezaDespesa: 1 }),
            // status é adicionado preventivamente
            statusClasse: 1,
            statusPdm: 1,
            statusItem: 1
        };

        // Dispara as chamadas para obter dados em paralelo para todos os endpoints
        const fetchPromises = ENDPOINT_KEYS_FOR_SEARCH.map(key => {
            const params = { ...baseParams };

            // Ajustes de parâmetros específicos por endpoint (evitando filtros desnecessários)
            if (key === 'caracteristicas') {
                if (!codigoItem) return Promise.resolve({}); // Só busca se houver Item
                params.codigoItem = codigoItem;
                // Deleta parâmetros de hierarquia superior que não são usados por este endpoint
                delete params.codigoGrupo; 
                delete params.codigoClasse;
                delete params.codigoPdm;
            } else if (key === 'natureza_despesa' || key === 'unidade_fornecimento') {
                if (!codigoPdm) return Promise.resolve({}); // Só busca se houver PDM
                params.codigoPdm = codigoPdm;
                // Deleta parâmetros de hierarquia superior que não são usados por este endpoint
                delete params.codigoGrupo;
                delete params.codigoClasse;
                delete params.codigoItem;
            }
            // Outros endpoints (classe, pdm, item) usam o baseParams que já contém a hierarquia.
            
            return fetchGatewayEndpoint({serviceName: SERVICE_NAME, endpointKey: key}, params);
        });
        
        const resultsArray = await Promise.all(fetchPromises);
        
        // Consolida todos os resultados em um único objeto
        const consolidatedData = resultsArray.reduce((acc, current) => ({ ...acc, ...current }), {});

        renderTable(consolidatedData);

    } catch (err) {
        statusMessageDiv.innerHTML = `<p class="text-danger">Falha crítica ao buscar dados: ${err.message}</p>`;
        console.error('Erro na requisição principal:', err);
    }
});

// --- INICIALIZAÇÃO ---

window.addEventListener('load', loadDropdowns);