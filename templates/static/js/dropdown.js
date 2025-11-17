import { fetchGatewayEndpoint } from "./api_gateway.js";

/**
 * Preenche um elemento <select> com opções buscadas de um endpoint de API.
 * * @param {object} config - Objeto de configuração para a operação.
 * @param {HTMLSelectElement} config.selectElement - O elemento <select> a ser preenchido.
 * @param {string} config.serviceName - Nome do serviço (ex: 'cadastro').
 * @param {string} config.endpointKey - Chave do endpoint (ex: 'grupo', 'classe').
 * @param {string} config.codeKey - Chave do campo que será o 'value' da option.
 * @param {string} config.nameKey - Chave do campo que será o 'textContent' da option.
 * @param {string} config.defaultText - Texto padrão da opção selecionada inicialmente (ex: 'Selecione um...').
 * @param {string | number | null} [config.filterCode=null] - Código de filtro opcional para o endpoint (ex: código do grupo para buscar classes).
 */
export async function populateSelect({
  selectElement,
  serviceName,
  endpointKey,
  codeKey,
  nameKey,
  defaultText,
  filterCode = null,
}) {
  // 1. Inicialização
  selectElement.innerHTML = `<option value="" selected>${defaultText}</option>`;
  selectElement.disabled = true;

  // 2. Pré-requisito de filtro
  if (endpointKey === "classe" && !filterCode) {
    selectElement.innerHTML =
      '<option value="" selected>Selecione um Grupo primeiro</option>';
    return;
  }

  try {
    const params = { pagina: 1 };

    // 3. Parâmetros específicos por endpoint (Mantido como estava)
    if (endpointKey === "grupo") {
      params.statusGrupo = "true";
    } else if (endpointKey === "classe") {
      params.codigoGrupo = filterCode;
    }

    // 4. Chamada da API
    const dataSet = await fetchGatewayEndpoint(
      {
        serviceName: serviceName,
        endpointKey: endpointKey
      },
      params
    );

    // 5. Tratamento de Erros e Dados
    const data = dataSet[endpointKey];

    if (!data) {
      throw new Error(`Dados de ${endpointKey} indisponíveis na resposta.`);
    }
    if (data.error) {
      throw new Error(`Erro ao carregar ${endpointKey}: ${data.error}`);
    }

    const list = data.resultado || data.content?.resultado || [];

    // 6. Tratamento de lista vazia
    if (list.length === 0) {
      selectElement.innerHTML = `<option value="">Nenhum item encontrado</option>`;
      selectElement.disabled = true;
      return;
    }

    // 7. Preenchimento do Select
    selectElement.innerHTML = `<option value="" selected>Selecione um...</option>`;

    list.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[codeKey];
      option.textContent =
        `${item[codeKey]} - ${item[nameKey]}` || item[codeKey];
      selectElement.appendChild(option);
    });

    selectElement.disabled = false;
  } catch (err) {
    // 8. Tratamento de Exceções
    console.error(`Erro ao carregar ${endpointKey}:`, err);
    selectElement.innerHTML = `<option value="">Falha ao carregar: ${err.message}</option>`;
    selectElement.disabled = true;
  }
}