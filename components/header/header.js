document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os botões que possuem um menu dropdown associado
    const toggleButtons = document.querySelectorAll('.hdr-toggle-btn');
    
    // Função para fechar todos os menus
    const closeAllMenus = () => {
        document.querySelectorAll('.hdr-user-dropdown').forEach(menu => {
            menu.classList.remove('is-open');
        });
        document.querySelectorAll('.hdr-toggle-btn').forEach(btn => {
            btn.classList.remove('active'); // Remove estado visual ativo do botão
        });
    };

    // Adiciona evento de clique para cada botão toggle
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique suba para o documento (que fecharia o menu)
            
            const targetId = button.getAttribute('data-target');
            const targetMenu = document.getElementById(targetId);
            const isOpen = targetMenu.classList.contains('is-open');

            // 1. Fecha tudo primeiro (efeito acordeão: um fecha o outro)
            closeAllMenus();

            // 2. Se não estava aberto, abre o clicado
            if (!isOpen) {
                targetMenu.classList.add('is-open');
                button.classList.add('active'); // Adiciona feedback visual no botão
            }
        });
    });

    // Impede que cliques DENTRO do menu fechem o menu
    document.querySelectorAll('.hdr-user-dropdown').forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Clicar em qualquer lugar fora fecha os menus
    document.addEventListener('click', () => {
        closeAllMenus();
    });
});