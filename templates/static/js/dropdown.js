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