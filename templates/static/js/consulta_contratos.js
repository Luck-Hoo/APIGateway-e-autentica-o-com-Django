import { fetchGatewayEndpoint } from './api_gateway.js';
import { currencyFormatter, formatDate } from './utils.js';

// --- CONFIGURAÇÕES GLOBAIS ---
const SERVICE_NAME = 'contratacoes';
const CONTRATACOES_ENDPOINT_KEY = "consultar_contratacoes";

// --- VARIÁVEIS DOM ---
const statusMessageDiv = document.getElementById("status-message");
const tableDiv = document.getElementById("contratacoes-data-table");
const tableBody = document.getElementById("table-body");
const searchButton = document.getElementById("search-btn");
const loadMoreButton = document.getElementById("load-more-btn");

// Inputs de Filtro (Coletados em um objeto para fácil gerenciamento)
const filterInputs = {
    codigoOrgao: document.getElementById("unidadeGestora-input"),
    codigoModalidade: document.getElementById("codigoModalidade-input"),
    dataPublicacaoPncpInicial: document.getElementById("dataInicial-input"),
    dataPublicacaoPncpFinal: document.getElementById("dataFinal-input"),
    tamanhoPagina: document.getElementById("tamanhoPagina-select"),
};

// --- ESTADO DA PESQUISA ---
let currentPage = 1;
let currentParams = {};

// --- FUNÇÕES DE API ---

/**
 * Função específica para chamar o endpoint de Contratações.
 * Utiliza o padrão de Objeto de Configuração para os parâmetros.
 * * @param {object} config - O objeto contendo os parâmetros de filtro.
 * @param {number} page - O número da página a ser carregada.
 * @returns {Promise<object>} - O objeto de resposta da API.
 */
async function fetchContratacoes(config, page) {
    // Mescla os parâmetros de filtro com o número da página
    const params = { ...config, pagina: page };

    const response = await fetchGatewayEndpoint(
        { 
            serviceName: SERVICE_NAME, 
            endpointKey: CONTRATACOES_ENDPOINT_KEY 
        }, 
        params
    );
    
    // Se a resposta modularizada da API contiver erro, lança exceção
    const apiData = response[CONTRATACOES_ENDPOINT_KEY];
    if (apiData && apiData.error) {
        throw new Error(apiData.error);
    }
    
    // Retorna a resposta completa (incluindo a chave do endpoint)
    return response;
}

// --- FUNÇÃO DE RENDERIZAÇÃO DA TABELA ---

/**
 * Renderiza as linhas de contrato na tabela.
 * @param {Array<object>} contratos - Lista de objetos de contrato.
 */
function renderTable(contratos) {
    if (contratos.length === 0) return;

    // Limpa o corpo da tabela antes de adicionar novas linhas
    tableBody.innerHTML = "";

    contratos.forEach((contrato) => {
        const newRow = tableBody.insertRow();

        // O valor 'numeroContrato' não existe neste JSON de compra, então mapeamos para um campo completo.
        const numControlePNCP = contrato.numeroControlePNCP ?? "—";
        
        // 'numeroCompra' no JSON é o número curto ('5', '13', '87', etc.)
        const idCompra = contrato.idCompra ?? "—"; 
        
        // Outros campos corrigidos para os nomes do JSON:
        const fornecedor = contrato.orgaoEntidadeRazaoSocial ?? "—";
        const modalidade = contrato.modalidadeNome ?? "—";
        const processo = contrato.processo ?? "—";
        
        // Os campos abaixo não existem no seu JSON de *Compra*, por isso retornam "—".
        // O JSON que você está obtendo é de COMPRA (licitação/credenciamento), e não de CONTRATO.
        const numParcelas = contrato.numParcelas ?? "—"; // Retorna "—"
        const valorParcelas = contrato.valorParcelas ?? "—"; // Retorna "—"

        // Formatação de valores
        const valorGlobal = contrato.valorTotalEstimado
            ? currencyFormatter.format(contrato.valorTotalEstimado) 
            : "—";

        // Datas
        const vigenciaInicial = formatDate(contrato.dataPublicacaoPncp); 
        const vigenciaFinal = formatDate(contrato.dataEncerramentoPropostaPncp);

        newRow.innerHTML = `
            <td>${numControlePNCP}</td>
            <td>${idCompra}</td>
            <td>${fornecedor}</td>
            <td>${modalidade}</td>
            <td>${processo}</td>
            <td>${numParcelas}</td>
            <td>${valorParcelas}</td>
            <td>${valorGlobal}</td>
            <td>${vigenciaInicial}</td>
            <td>${vigenciaFinal}</td>
        `;
    });

    tableDiv.style.display = "block";
}

// --- LÓGICA DE PESQUISA E PAGINAÇÃO ---

/**
 * Executa a lógica de pesquisa e paginação.
 * @param {number} [page=1] - A página a ser carregada.
 */
async function performSearch(page = 1) {
    searchButton.disabled = true;
    loadMoreButton.disabled = true;
    loadMoreButton.style.display = "none";

    if (page === 1) {
        tableBody.innerHTML = "";
        tableDiv.style.display = "none";
        
        // Coleta de Parâmetros e Criação do Objeto de Configuração
        currentParams = {
            dataPublicacaoPncpInicial: filterInputs.dataPublicacaoPncpInicial.value,
            dataPublicacaoPncpFinal: filterInputs.dataPublicacaoPncpFinal.value,
            codigoOrgao: filterInputs.codigoOrgao.value,
            codigoModalidade: filterInputs.codigoModalidade.value,
            tamanhoPagina: filterInputs.tamanhoPagina.value,
        };
        
        // Limpeza: Remove parâmetros vazios (cria o Objeto de Configuração Final)
        Object.keys(currentParams).forEach(
            (key) => currentParams[key] === "" && delete currentParams[key]
        );

        // Validação Mínima
        if (
            !currentParams.dataPublicacaoPncpInicial ||
            !currentParams.dataPublicacaoPncpFinal ||
            !currentParams.codigoModalidade
        ) {
            statusMessageDiv.innerHTML =
                '<p class="text-danger">As datas Inicial, Final e o **Código da Modalidade** são obrigatórios.</p>';
            searchButton.disabled = false;
            return;
        }
    }

    statusMessageDiv.innerHTML = '<button class="btn btn-primary" type="button" disabled><span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span role="status"> Carregando...</span></button>';

    try {
        // 1. Chamada à API usando o Objeto de Configuração (currentParams)
        const response = await fetchContratacoes(currentParams, page);

        // 2. Acessa os dados reais (resultado e paginação)
        const apiData = response[CONTRATACOES_ENDPOINT_KEY]; 

        const contratos = apiData?.resultado || []; 
        const totalPages = apiData?.totalPaginas || page; // Usa totalPaginas do JSON
        
        if (contratos.length === 0 && page === 1) {
            statusMessageDiv.innerHTML =
                '<p class="text-warning">Nenhum contrato encontrado com os filtros fornecidos.</p>';
            tableDiv.style.display = "none";
            return;
        }

        renderTable(contratos);

        // Lógica de Paginação
        currentPage = page;
        if (currentPage < totalPages) {
            loadMoreButton.style.display = "block";
            loadMoreButton.disabled = false;
            loadMoreButton.textContent = `Carregar Mais (Página ${currentPage + 1} de ${totalPages})`;
            if (page === 1) {
                statusMessageDiv.innerHTML = '<p class="text-success">Dados consultados com sucesso!</p>';
            }
        } else {
            loadMoreButton.style.display = "none";
            statusMessageDiv.innerHTML =
                '<p class="text-success">Todos os dados foram carregados.</p>';
        }

        if (page === 1 && totalPages > 1) {
             statusMessageDiv.innerHTML =
                '<p class="text-success">Dados consultados com sucesso!</p>';
        }

    } catch (err) {
        statusMessageDiv.innerHTML = `<p class="text-danger">Falha ao buscar Contratos: ${err.message}</p>`;
        console.error("Erro de consulta:", err);
        tableDiv.style.display = "none";
    } finally {
        searchButton.disabled = false;
        if (loadMoreButton.style.display === "block") {
            loadMoreButton.disabled = false;
        }
    }
}

// --- EVENT LISTENERS E INICIALIZAÇÃO ---

// Define os listeners para pesquisa (sempre página 1)
searchButton.addEventListener("click", () => performSearch(1));

// Define o listener para carregar mais (próxima página)
loadMoreButton.addEventListener("click", () =>
    performSearch(currentPage + 1)
);

// Inicialização
window.addEventListener("load", () => {
    loadMoreButton.style.display = "none";
});