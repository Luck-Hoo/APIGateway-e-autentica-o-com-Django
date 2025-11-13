/**
 * Aplica o modo escuro no BODY e atualiza o botão.
 * @param {boolean} isDarkMode - True para modo escuro, False para modo claro.
 */
function applyDarkMode(isDarkMode) {
    const toggleButton = document.getElementById('darkModeToggle');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (toggleButton) {
            // Se ativado, mostra a opção para voltar ao Claro (Sol)
            toggleButton.innerHTML = '<i class="bi bi-sun"></i> Claro';
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (toggleButton) {
            // Se desativado, mostra a opção para ir para o Escuro (Lua)
            toggleButton.innerHTML = '<i class="bi bi-moon-stars"></i> Escuro';
        }
    }
}

/**
 * Carrega a preferência salva no localStorage ao iniciar a página.
 */
function loadUserPreference() {
    const savedPreference = localStorage.getItem('darkModePreference');
    
    // Se a preferência for 'enabled', ativa o modo escuro
    if (savedPreference === 'enabled') {
        applyDarkMode(true);
    } 
    // Se a preferência for 'disabled' ou não existir (primeiro acesso), aplica modo claro.
    else {
        applyDarkMode(false); 
    }
}

// Evento: Garante que o código só execute quando o DOM estiver completamente carregado.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega a preferência de tema do usuário (e configura o botão visualmente)
    loadUserPreference(); 

    const toggleButton = document.getElementById('darkModeToggle');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            // O estado atual é lido antes de alternar
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            
            // Alterna o modo (se estava escuro, vai para claro; se estava claro, vai para escuro)
            applyDarkMode(!isCurrentlyDark);

            // Salva a nova preferência no localStorage
            if (!isCurrentlyDark) {
                // Se NÃO estava escuro (estava claro), agora está escuro -> Salva 'enabled'
                localStorage.setItem('darkModePreference', 'enabled');
            } else {
                // Se estava escuro, agora está claro -> Salva 'disabled'
                localStorage.setItem('darkModePreference', 'disabled');
            }
        });
    }
});