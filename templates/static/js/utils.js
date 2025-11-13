// Função para formatar números como moeda
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
});

// Função auxiliar para formatar data (assumindo formato ISO 8601)
function formatDate(isoDate) {
    if (!isoDate) return '—';
    // Remove o T e as horas para evitar problemas de fuso horário
    const datePart = isoDate.split('T')[0];
    const parts = datePart.split('-'); // [AAAA, MM, DD]
    if (parts.length === 3) {
        // Retorna no formato DD/MM/AAAA
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
}