import { fetchGatewayEndpoint } from "./api_gateway.js";


export async function populateSelect(
  selectElement,
  serviceName,
  endpointKey,
  codeKey,
  nameKey,
  defaultText,
  filterCode = null
) {
  selectElement.innerHTML = `<option value="" selected>${defaultText}</option>`;
  selectElement.disabled = true;

  if (endpointKey === "classe" && !filterCode) {
    selectElement.innerHTML =
      '<option value="" selected>Selecione um Grupo primeiro</option>';
    return;
  }

  try {
    const params = { pagina: 1 };

    // Parâmetros específicos por endpoint
    if (endpointKey === "grupo") {
      params.statusGrupo = "true";
    } else if (endpointKey === "classe") {
      params.codigoGrupo = filterCode;
    }

    const dataSet = await fetchGatewayEndpoint(
      serviceName,
      endpointKey,
      params
    );

    // O retorno de fetchEndpoint é um objeto { endpointKey: data } ou { endpointKey: { error: ... } }
    const data = dataSet[endpointKey];

    if (!data) {
      throw new Error(`Dados de ${endpointKey} indisponíveis na resposta.`);
    }
    if (data.error) {
      throw new Error(`Erro ao carregar ${endpointKey}: ${data.error}`);
    }

    const list = data.resultado || data.content?.resultado || [];

    if (list.length === 0) {
      selectElement.innerHTML = `<option value="">Nenhum item encontrado</option>`;
      selectElement.disabled = true;
      return;
    }

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
    console.error(`Erro ao carregar ${endpointKey}:`, err);
    selectElement.innerHTML = `<option value="">Falha ao carregar: ${err.message}</option>`;
    selectElement.disabled = true;
  }
}
