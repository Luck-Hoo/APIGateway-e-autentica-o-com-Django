import { fetchGatewayEndpoint } from './api_gateway.js';
import { currencyFormatter, formatDate } from './utils.js';

// Variáveis DOM
const statusMessageDiv = document.getElementById("status-message");
const tableDiv = document.getElementById("contratacoes-data-table");
const tableBody = document.getElementById("table-body");
const searchButton = document.getElementById("search-btn");
const loadMoreButton = document.getElementById("load-more-btn");
const codigoOrgao = document.getElementById("unidadeGestora-input");
const codigoModalidadeInput = document.getElementById("codigoModalidade-input");
const dataPublicacaoPncpInicial = document.getElementById("dataInicial-input");
const dataPublicacaoPncpFinal = document.getElementById("dataFinal-input");
const tamanhoPaginaSelect = document.getElementById("tamanhoPagina-select");

// Estado da Pesquisa
let currentPage = 1;
let currentParams = {};
const SERVICE_NAME = 'contratacoes';
const CONTRATACOES_ENDPOINT_KEY = "consultar_contratacoes";

// --- FUNÇÕES DE API ---

/**
 * Função específica para chamar o endpoint de Contratações, usando o módulo API.
 */
async function fetchContratacoes(params, page = 1) {
    const data = await fetchGatewayEndpoint(
        SERVICE_NAME, 
        CONTRATACOES_ENDPOINT_KEY, 
        { ...params, pagina: page }
    );
    
    // Se a resposta modularizada da API contiver erro, lança exceção
    if (data.error) {
        throw new Error(data.error);
    }
    return data;
}

// --- FUNÇÃO DE RENDERIZAÇÃO DA TABELA ---

/**
 * Renderiza as linhas de contrato na tabela.
 */
function renderTable(contratos) {
    if (contratos.length === 0) return;

    contratos.forEach((contrato) => {
        const newRow = tableBody.insertRow();

        const numCompra = contrato.numeroCompra ?? "—";
        const fornecedor = contrato.orgaoEntidadeRazaoSocial ?? "—";
        const modalidade = contrato.modalidadeNome ?? "—";
        const processo = contrato.processo ?? "—";
        const numParcelas = contrato.numParcelas ?? "—";
        const valorParcelas = contrato.valorParcelas ?? "—";

        // Usando utilitário de formatação de moeda
        const valorGlobal = contrato.valorTotalEstimado
            ? currencyFormatter.format(contrato.valorTotalEstimado) 
            : "—";

        // Usando utilitário de formatação de data
        const vigenciaInicial = formatDate(contrato.dataPublicacaoPncp);
        const vigenciaFinal = formatDate(contrato.dataEncerramentoPropostaPncp);

        newRow.innerHTML = `
            <td></td>
            <td>${numCompra}</td>
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
 */
async function performSearch(page = 1) {
    searchButton.disabled = true;
    loadMoreButton.disabled = true;
    loadMoreButton.style.display = "none";

    if (page === 1) {
        tableBody.innerHTML = "";
        tableDiv.style.display = "none";
        
        currentParams = {
            dataPublicacaoPncpInicial: dataPublicacaoPncpInicial.value,
            dataPublicacaoPncpFinal: dataPublicacaoPncpFinal.value,
            codigoOrgao: codigoOrgao.value,
            codigoModalidade: codigoModalidadeInput.value,
            tamanhoPagina: tamanhoPaginaSelect.value,
        };
        
        // Remove parâmetros vazios
        Object.keys(currentParams).forEach(
            (key) => currentParams[key] === "" && delete currentParams[key]
        );

        // Validação
        if (
            !currentParams.dataPublicacaoPncpInicial ||
            !currentParams.dataPublicacaoPncpFinal ||
            !currentParams.codigoModalidade
        ) {
            statusMessageDiv.innerHTML =
                '<p class="text-danger">As datas Inicial, Final e o Código da Modalidade são obrigatórios.</p>';
            searchButton.disabled = false;
            return;
        }
    }

    statusMessageDiv.innerHTML = `<p class="text-info"><i class="bi bi-arrow-clockwise spin"></i> Carregando página ${page}...</p>`;

    try {
        const data = await fetchContratacoes(currentParams, page);
        const contratos = data.resultado || []; 
        const totalPages = data.pagination?.totalPages || page; // Usa Optional Chaining

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
        } else {
            loadMoreButton.style.display = "none";
            statusMessageDiv.innerHTML =
                '<p class="text-success">Todos os dados foram carregados.</p>';
        }

        if (page === 1) {
            statusMessageDiv.innerHTML =
                '<p class="text-success">Dados consultados com sucesso!</p>';
            tableDiv.style.display = "block";
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

// Define os listeners para pesquisa e carregar mais
searchButton.addEventListener("click", () => performSearch(1));

loadMoreButton.addEventListener("click", () =>
    performSearch(currentPage + 1)
);

// Inicialização
window.addEventListener("load", () => {
    loadMoreButton.style.display = "none";
});