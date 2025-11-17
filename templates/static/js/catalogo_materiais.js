import { populateSelect } from './dropdown.js';
import { fetchGatewayEndpoint } from './api_gateway.js';

// Variáveis DOM
const statusMessageDiv = document.getElementById('status-message');
const tableDiv = document.getElementById('material-data-table');
const tableBody = document.getElementById('table-body');

// Selects para filtros
const nomeGrupoSelect = document.getElementById('nomeGrupo-select');
const classeSelect = document.getElementById('classe-select');
const pdmSelect = document.getElementById('pdm-select');
const itemSelect = document.getElementById('item-select');
const naturezaDespesaSelect = document.getElementById('naturezaDespesa-select');
const unidadeFornecimentoSelect = document.getElementById('unidadeFornecimento-select');
const caracteristicasSelect = document.getElementById('caracteristicas-select');

const searchButton = document.getElementById('search-btn');

// Configurações dos Endpoints a serem consultados no click
// Incluímos todos os endpoints documentados para retornar dados em conjunto, se necessário.
const ENDPOINT_KEYS_FOR_SEARCH = [
    'grupo', // Apenas para garantia, se precisar de dados adicionais do grupo
    'classe',
    'pdm',
    'item',
    'natureza_despesa',
    'unidade_fornecimento',
    'caracteristicas'
];

// Serviço utilizado (Dicionário mestre Gateway)
const SERVICE_NAME = 'material';

// Função auxiliar para resetar selects dependentes
function resetSelects(selects) {
    selects.forEach(select => {
        select.innerHTML = `<option value="" selected>${select.getAttribute('data-default-message')}</option>`;
        select.disabled = true;
    });
    tableDiv.style.display = 'none';
    statusMessageDiv.innerHTML = '';
}

// Carregamento inicial de Dropdowns (Apenas Grupo)
async function loadDropdowns() {
    await populateSelect(
        nomeGrupoSelect,
        SERVICE_NAME,
        'grupo',
        'codigoGrupo',
        'nomeGrupo',
        'Carregando Grupos...'
    );

    // Adiciona as mensagens default e reseta os dependentes
    classeSelect.setAttribute('data-default-message', 'Selecione um Grupo primeiro');
    pdmSelect.setAttribute('data-default-message', 'Selecione uma Classe primeiro');
    itemSelect.setAttribute('data-default-message', 'Selecione um PDM primeiro');
    naturezaDespesaSelect.setAttribute('data-default-message', 'Selecione um PDM primeiro');
    unidadeFornecimentoSelect.setAttribute('data-default-message', 'Selecione um PDM primeiro');
    caracteristicasSelect.setAttribute('data-default-message', 'Selecione um Item primeiro');
    
    resetSelects([classeSelect, pdmSelect, itemSelect, naturezaDespesaSelect, unidadeFornecimentoSelect, caracteristicasSelect]);
}

// --- LÓGICA DE RENDERIZAÇÃO E BUSCA ---

function renderTable(data) {
    const errors = Object.entries(data).filter(([, value]) => value && value.error);
    const classesList = data.classe?.resultado || [];

    if (errors.length > 0) {
        const errorMessage = errors
            .map(([key, value]) => `**[${key.toUpperCase()}]:** ${value.error}`)
            .join('<br>');

        statusMessageDiv.innerHTML = `<p class="text-danger">Erros encontrados:<br>${errorMessage}</p>`;
        tableDiv.style.display = 'none';
        return;
    }

    if (classesList.length === 0) {
        statusMessageDiv.innerHTML = '<p class="text-warning">Nenhum material encontrado para os filtros selecionados.</p>';
        tableBody.innerHTML = '';
        tableDiv.style.display = 'none';
        return;
    }

    statusMessageDiv.innerHTML = `<p class="text-success">Dados consultados com sucesso! ${classesList.length} classes encontradas.</p>`;

    // Mapeamento de dados de outros endpoints para fácil acesso
    const pdmMap = (data.pdm?.resultado || []).reduce((acc, item) => { acc[item.codigoPdm] = item; return acc; }, {});
    const itemMap = (data.item?.resultado || []).reduce((acc, item) => { acc[item.codigoItem] = item; return acc; }, {});
    const naturezaMap = (data.natureza_despesa?.resultado || []).reduce((acc, item) => { acc[item.codigoPdm] = item; return acc; }, {});
    const unidadeMap = (data.unidade_fornecimento?.resultado || []).reduce((acc, item) => { acc[item.codigoPdm] = item; return acc; }, {});
    const caracteristicasMap = (data.caracteristicas?.resultado || []).reduce((acc, item) => { acc[item.codigoItem] = item; return acc; }, {});


    tableBody.innerHTML = ''; // Limpa a tabela

    // Itera sobre as classes, que é o resultado principal
    classesList.forEach(classeItem => {
        const codigoGrupo = classeItem.codigoGrupo || '';
        const nomeGrupo = nomeGrupoSelect.options[nomeGrupoSelect.selectedIndex]?.textContent.split(' - ')[1] || 'Grupo Selecionado';
        const codigoClasse = classeItem.codigoClasse || '';
        const nomeClasse = classeItem.nomeClasse || 'Não informado';

        // Aqui assumimos que, se houver classe, haverá pelo menos um PDM/Item relacionado nos outros resultados
        // Como não sabemos a ligação 1:1, vamos tentar buscar o primeiro item relacionado ao PDM e Item filtrados
        
        // PDM: Busca um PDM relacionado ao grupo e classe
        const pdmEncontrado = Object.values(pdmMap).find(pdm => pdm.codigoGrupo == codigoGrupo && pdm.codigoClasse == codigoClasse);
        const pdmInfo = pdmEncontrado ? `${pdmEncontrado.codigoPdm} - ${pdmEncontrado.nomePdm}` : 'N/A';

        // Item: Busca um Item relacionado ao PDM encontrado
        const itemEncontrado = Object.values(itemMap).find(item => item.codigoPdm == pdmEncontrado?.codigoPdm);
        const itemInfo = itemEncontrado ? `${itemEncontrado.codigoItem} - ${itemEncontrado.descricaoItem}` : 'N/A';

        // Natureza Despesa: Busca Natureza relacionada ao PDM encontrado
        const naturezaEncontrada = Object.values(naturezaMap).find(nd => nd.codigoPdm == pdmEncontrado?.codigoPdm);
        const naturezaInfo = naturezaEncontrada ? `${naturezaEncontrada.codigoNaturezaDespesa} - ${naturezaEncontrada.nomeNaturezaDespesa}` : 'N/A';
        
        // Unidade Fornecimento: Busca Unidade relacionada ao PDM encontrado
        const unidadeEncontrada = Object.values(unidadeMap).find(uf => uf.codigoPdm == pdmEncontrado?.codigoPdm);
        const unidadeInfo = unidadeEncontrada ? `${unidadeEncontrada.siglaUnidadeFornecimento} - ${unidadeEncontrada.nomeUnidadeFornecimento}` : 'N/A';

        // Características: Busca Características relacionadas ao Item encontrado
        const caracteristicaEncontrada = Object.values(caracteristicasMap).find(carac => carac.codigoItem == itemEncontrado?.codigoItem);
        const caracteristicaInfo = caracteristicaEncontrada ? `${caracteristicaEncontrada.nomeCaracteristica}: ${caracteristicaEncontrada.nomeValorCaracteristica}` : 'N/A';
        
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

// --- EVENT LISTENERS GERAIS (Lógica de Cascata) ---

// 1. Listener para carregar a Classe após selecionar o Grupo
nomeGrupoSelect.addEventListener('change', () => {
    const selectedGroupId = nomeGrupoSelect.value;
    resetSelects([classeSelect, pdmSelect, itemSelect, naturezaDespesaSelect, unidadeFornecimentoSelect, caracteristicasSelect]);

    if (selectedGroupId) {
        populateSelect(
            classeSelect,
            SERVICE_NAME,
            'classe',
            'codigoClasse',
            'nomeClasse',
            'Carregando Classes...',
            selectedGroupId, // Param: codigoGrupo
            { statusClasse: 1 }
        );
    }
});

// 2. Listener para carregar PDM após selecionar a Classe
classeSelect.addEventListener('change', () => {
    const selectedClassId = classeSelect.value;
    const selectedGroupId = nomeGrupoSelect.value;
    resetSelects([pdmSelect, itemSelect, naturezaDespesaSelect, unidadeFornecimentoSelect, caracteristicasSelect]);

    if (selectedClassId && selectedGroupId) {
        populateSelect(
            pdmSelect,
            SERVICE_NAME,
            'pdm',
            'codigoPdm',
            'nomePdm',
            'Carregando PDMs...',
            selectedGroupId, // Param: codigoGrupo
            { codigoClasse: selectedClassId, statusPdm: 1 }
        );
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
        populateSelect(
            itemSelect,
            SERVICE_NAME,
            'item',
            'codigoItem',
            'descricaoItem',
            'Carregando Itens...',
            selectedGroupId, // Param: codigoGrupo
            { codigoClasse: selectedClassId, codigoPdm: selectedPdmId, statusItem: 1 }
        );
        
        // Carrega NATUREZA DESPESA (depende apenas do PDM)
        populateSelect(
            naturezaDespesaSelect,
            SERVICE_NAME,
            'natureza_despesa',
            'codigoNaturezaDespesa',
            'nomeNaturezaDespesa',
            'Carregando Naturezas...',
            null,
            { codigoPdm: selectedPdmId, statusNaturezaDespesa: 1 }
        );

        // Carrega UNIDADE FORNECIMENTO (depende apenas do PDM)
        populateSelect(
            unidadeFornecimentoSelect,
            SERVICE_NAME,
            'unidade_fornecimento',
            'siglaUnidadeFornecimento',
            'nomeUnidadeFornecimento',
            'Carregando Unidades...',
            null,
            { codigoPdm: selectedPdmId, statusUnidadeFornecimentoPdm: 1 }
        );
    }
});

// 4. Listener para carregar Características após selecionar o Item
itemSelect.addEventListener('change', () => {
    const selectedItemId = itemSelect.value;
    resetSelects([caracteristicasSelect]);

    if (selectedItemId) {
        populateSelect(
            caracteristicasSelect,
            SERVICE_NAME,
            'caracteristicas',
            'codigoCaracteristica', // Usaremos o código da característica como valor
            'nomeCaracteristica',
            'Carregando Características...',
            null,
            { codigoItem: selectedItemId }
        );
    }
});


// LÓGICA DE PESQUISA
searchButton.addEventListener('click', async function () {
    const codigoGrupo = nomeGrupoSelect.value;
    
    // Obter todos os valores selecionados (filtros)
    const codigoClasse = classeSelect.value;
    const codigoPdm = pdmSelect.value;
    const codigoItem = itemSelect.value;
    const codigoNaturezaDespesa = naturezaDespesaSelect.value;
    const siglaUnidadeFornecimento = unidadeFornecimentoSelect.value;
    const codigoCaracteristica = caracteristicasSelect.value; // Usado apenas como filtro, se necessário

    if (!codigoGrupo) {
        statusMessageDiv.innerHTML = '<p class="text-danger">O Grupo é obrigatório para a consulta.</p>';
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
            // Adicionar filtros, se selecionados
            ...(codigoClasse && { codigoClasse: codigoClasse, statusClasse: 1 }),
            ...(codigoPdm && { codigoPdm: codigoPdm, statusPdm: 1 }),
            ...(codigoItem && { codigoItem: codigoItem, statusItem: 1 }),
            // Natureza e Unidade dependem do PDM (já incluído) e têm seus próprios códigos para filtro
            // Não há filtro direto por siglaUnidadeFornecimento na documentação fornecida, 
            // mas podemos passar os outros filtros relacionados ao PDM.
            ...(codigoNaturezaDespesa && { codigoNaturezaDespesa: codigoNaturezaDespesa, statusNaturezaDespesa: 1 }),
            // Características depende do Item
            // A consulta de caracteristicas só usa codigoItem, que é o que já está filtrado acima.
            
            // Adicionando um status padrão onde aplicável
            statusClasse: 1,
            statusPdm: 1,
            statusItem: 1
        };

        // Dispara as chamadas para obter dados, utilizando os filtros.
        // O `fetchGatewayEndpoint` deve saber como mapear o `key` para os parâmetros corretos.
        // Para simplificar a exibição dos dados na tabela, vamos garantir que a classe sempre seja buscada
        // e os demais endpoints filtrem a partir dela.

        const fetchPromises = ENDPOINT_KEYS_FOR_SEARCH.map(key => {
            // A consulta principal é por classe, as demais usam a hierarquia.
            const params = { ...baseParams };

            // Ajustes de parâmetros por endpoint
            if (key === 'caracteristicas') {
                if (!codigoItem) return Promise.resolve({}); // Só busca se tiver Item
                params.codigoItem = codigoItem;
                delete params.codigoGrupo;
                delete params.codigoClasse;
                delete params.codigoPdm;
            } else if (key === 'natureza_despesa' || key === 'unidade_fornecimento') {
                if (!codigoPdm) return Promise.resolve({}); // Só busca se tiver PDM
                params.codigoPdm = codigoPdm;
                delete params.codigoGrupo;
                delete params.codigoClasse;
                delete params.codigoItem;
            }
            
            return fetchGatewayEndpoint(SERVICE_NAME, key, params);
        });
        
        const resultsArray = await Promise.all(fetchPromises);
        const consolidatedData = resultsArray.reduce((acc, current) => ({ ...acc, ...current }), {});

        renderTable(consolidatedData);

    } catch (err) {
        statusMessageDiv.innerHTML = `<p class="text-danger">Falha crítica ao buscar dados: ${err.message}</p>`;
        console.error(err);
    }
});

window.addEventListener('load', loadDropdowns);