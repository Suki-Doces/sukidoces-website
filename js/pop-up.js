// Função para fechar o popup
function fecharPopup() {
    document.getElementById("popup-sucesso").style.display = "none";
}

// Ativar popup se ?sucesso=1
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('sucesso') === '1') {
    document.getElementById("popup-sucesso").style.display = "flex";
}

