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
        const CONTRATACOES_ENDPOINT_KEY = "consultar_contratacoes";


        // --- FUNÇÃO DE CHAMADA DA API (Mantida) ---
        async function fetchContratacoes(params, page = 1) {
            // ... (código fetchContratacoes)
            const query = new URLSearchParams({
                ...params,
                pagina: page,
            }).toString();
            const url = `/gateway/contratacoes/${CONTRATACOES_ENDPOINT_KEY}/?${query}`;

            const res = await fetch(url);

            if (!res.ok) {
                try {
                    const errorData = await res.json();
                    const errorMessage = errorData.error || `Erro HTTP ${res.status}`;
                    throw new Error(errorMessage);
                } catch {
                    throw new Error(`Falha ao conectar/HTTP ${res.status}`);
                }
            }
            const data = await res.json();
            return data;
        }

        // --- LÓGICA DE PESQUISA (Mantida) ---
        async function performSearch(page = 1) {
            // ... (código performSearch)
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
                Object.keys(currentParams).forEach(
                    (key) => currentParams[key] === "" && delete currentParams[key]
                );

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

                const totalPages = data.pagination
                    ? data.pagination.totalPages
                    : page; 

                if (contratos.length === 0 && page === 1) {
                    statusMessageDiv.innerHTML =
                        '<p class="text-warning">Nenhum contrato encontrado com os filtros fornecidos.</p>';
                    tableDiv.style.display = "none";
                    return;
                }

                renderTable(contratos);

                currentPage = page;
                if (currentPage < totalPages) {
                    loadMoreButton.style.display = "block";
                    loadMoreButton.disabled = false;
                    loadMoreButton.textContent = `Carregar Mais (Página ${currentPage + 1
                        } de ${totalPages})`;
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

        // --- FUNÇÃO DE RENDERIZAÇÃO DA TABELA (Mantida) ---
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

                const valorGlobal = contrato.valorTotalEstimado
                    ? formatter.format(contrato.valorTotalEstimado)
                    : "—";

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

        // --- EVENT LISTENERS (Mantidos) ---
        searchButton.addEventListener("click", () => performSearch(1));

        loadMoreButton.addEventListener("click", () =>
            performSearch(currentPage + 1)
        );

        // Carregamento inicial
        window.addEventListener("load", () => {
            loadMoreButton.style.display = "none";
        });