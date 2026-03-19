function openCatalogTab(evt, tabName) {
    // 1. Esconde todos os conteúdos
    var i, tabContent, tabBtns;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("active");
    }

    // 2. Reseta o estilo de todos os botões para "contoured" (borda apenas)
    tabBtns = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("button-fill");
        tabBtns[i].classList.add("button-contoured");
    }

    // 3. Mostra o conteúdo atual e define o botão clicado como "fill" (preenchido)
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.remove("button-contoured");
    evt.currentTarget.classList.add("button-fill");
}