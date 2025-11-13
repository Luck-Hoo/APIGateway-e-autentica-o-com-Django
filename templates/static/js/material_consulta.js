// Script específico para a página de Consulta de Material (Catálogo)

// Variáveis DOM
const statusMessageDiv = document.getElementById('status-message');
const tableDiv = document.getElementById('material-data-table');
const tableBody = document.getElementById('table-body');
const nomeGrupoSelect = document.getElementById('nomeGrupo-select');
const classeSelect = document.getElementById('classe-select');
const searchButton = document.getElementById('search-btn');

// Configurações do Endpoint
const ENDPOINT_KEYS_FOR_SEARCH = [
    'grupo',
    'classe',
];
const SERVICE_NAME = 'material';

/**
 * Função genérica para chamar os endpoints do Gateway API.
 */
async function fetchEndpoint(endpointKey, params) {
    const query = new URLSearchParams(params).toString();
    const url = `/gateway/${SERVICE_NAME}/${endpointKey}/?${query}`;

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

/**
 * Preenche um dropdown com dados da API.
 */
async function populateSelect(selectElement, endpointKey, codeKey, nameKey, defaultText, filterCode = null) {
    selectElement.innerHTML = `<option value="" selected>${defaultText}</option>`;
    selectElement.disabled = true;

    if (endpointKey === 'classe' && !filterCode) {
        selectElement.innerHTML = '<option value="" selected>Selecione um Grupo primeiro</option>';
        return;
    }

    try {
        const params = { pagina: 1 };

        if (endpointKey === 'grupo') {
            params.statusGrupo = 'true';
        }

        if (endpointKey === 'classe') {
            params.codigoGrupo = filterCode;
        }

        const url = `/gateway/${SERVICE_NAME}/${endpointKey}/?${new URLSearchParams(params).toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            const errorMsg = data.error || `Erro de resposta da API: ${res.status}`;
            throw new Error(errorMsg);
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

// Carregamento inicial de Dropdowns (Apenas Grupo)
async function loadDropdowns() {
    await populateSelect(
        nomeGrupoSelect,
        'grupo',
        'codigoGrupo',
        'nomeGrupo',
        'Carregando Grupos...'
    );

    classeSelect.innerHTML = '<option value="" selected>Selecione um Grupo primeiro</option>';
    classeSelect.disabled = true;
}

// --- LÓGICA DE RENDERIZAÇÃO E BUSCA ---

function renderTable(data) {
    const errors = Object.entries(data).filter(([key, value]) => value && value.error);

    if (errors.length > 0) {
        const errorMessage = errors
            .map(([key, value]) => `**[${key.toUpperCase()}]:** ${value.error}`)
            .join('<br>');

        statusMessageDiv.innerHTML = `<p class="text-danger">Erros encontrados:<br>${errorMessage}</p>`;
        tableDiv.style.display = 'none';
        return;
    }

    statusMessageDiv.innerHTML = '<p class="text-success">Dados consultados com sucesso!</p>';

    // 1. Pega o nome do Grupo selecionado no dropdown
    const nomeGrupoOption = nomeGrupoSelect.options[nomeGrupoSelect.selectedIndex];
    // Extrai o nome do grupo: "10 - Nome do Grupo" -> "Nome do Grupo"
    const nomeGrupo = nomeGrupoOption.textContent.split(' - ')[1] || 'Grupo Selecionado';

    // 2. Pega a lista de classes
    const classesList = data.classe?.resultado || [];

    if (classesList.length === 0) {
        statusMessageDiv.innerHTML = '<p class="text-warning">Nenhuma classe de material encontrada para os filtros selecionados.</p>';
        tableBody.innerHTML = '';
        tableDiv.style.display = 'none';
        return;
    }

    tableBody.innerHTML = ''; // Limpa a tabela

    // 3. Itera sobre a lista de classes e cria uma linha para cada
    classesList.forEach(classeItem => {
        const codigoGrupo = classeItem.codigoGrupo || '';
        const codigoClasse = classeItem.codigoClasse || '';
        const nomeClasse = classeItem.nomeClasse || 'Não informado';

        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${codigoGrupo} - ${nomeGrupo}</td>
            <td>${codigoClasse} - ${nomeClasse}</td>
        `;
    });

    tableDiv.style.display = 'block';
}

// --- EVENT LISTENERS GERAIS ---

// Listener para carregar a Classe após selecionar o Grupo
nomeGrupoSelect.addEventListener('change', () => {
    const selectedGroupId = nomeGrupoSelect.value;

    if (selectedGroupId) {
        populateSelect(
            classeSelect,
            'classe',
            'codigoClasse',
            'nomeClasse',
            'Carregando Classes...',
            selectedGroupId
        );
    } else {
        classeSelect.innerHTML = '<option value="" selected>Selecione um Grupo primeiro</option>';
        classeSelect.disabled = true;
        tableDiv.style.display = 'none';
    }
});

// LÓGICA DE PESQUISA
searchButton.addEventListener('click', async function () {
    const codigoGrupo = nomeGrupoSelect.value;
    const codigoClasse = classeSelect.value;

    if (!codigoGrupo) {
        statusMessageDiv.innerHTML = '<p class="text-danger">O Grupo é obrigatório para a consulta.</p>';
        tableDiv.style.display = 'none';
        return;
    }

    statusMessageDiv.innerHTML = '<p class="text-info"><i class="bi bi-arrow-clockwise spin"></i> Carregando dados...</p>';
    tableBody.innerHTML = '';
    tableDiv.style.display = 'none';

    try {
        const baseParams = {
            pagina: 1,
            codigoGrupo: codigoGrupo,
            statusClasse: 1
        };

        if (codigoClasse) baseParams.codigoClasse = codigoClasse;

        // Dispara as chamadas para obter dados do grupo e da(s) classe(s)
        const fetchPromises = ENDPOINT_KEYS_FOR_SEARCH.map(key => fetchEndpoint(key, baseParams));

        const resultsArray = await Promise.all(fetchPromises);
        const consolidatedData = resultsArray.reduce((acc, current) => ({ ...acc, ...current }), {});

        renderTable(consolidatedData);

    } catch (err) {
        statusMessageDiv.innerHTML = `<p class="text-danger">Falha crítica ao buscar dados: ${err.message}</p>`;
        console.error(err);
    }
});

// Carregamento inicial dos dropdowns
window.addEventListener('load', loadDropdowns);