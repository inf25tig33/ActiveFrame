//Verifica e obter o user
function verificarEObterUtilizadorId() {
    const sessao = localStorage.getItem('sessao_ativa');
    
    // Existe um token?
    if (!sessao) {
        window.location.href = 'index.html';
        return null;
    }

    const utilizadores = JSON.parse(localStorage.getItem('utilizadores_json')) || [];
    const utilizadorAtual = utilizadores.find(u => u.username === sessao);

    // O user existe?
    if (!utilizadorAtual) {
        alert('Sessão inválida ou utilizador não encontrado.');
        window.location.href = 'index.html';
        return null;
    }

    // apanha o nome do user
    const eleNomeTopo = document.getElementById('nome-utilizador-topo');
    if (eleNomeTopo) eleNomeTopo.textContent = utilizadorAtual.username;

    // DEVOLVE O ID para o script que chamou a função
    return utilizadorAtual.id;
}

//Função de logout
function fazerLogout() {
    const utilizador = localStorage.getItem('sessao_ativa');
    alert('Até à próxima, ' + utilizador + '!');
    localStorage.removeItem('sessao_ativa');
    window.location.href = 'index.html';
}

//Abre a imagem
function abrirModal(src) {
    const modal = document.getElementById('modal-foto');
    const imgModal = document.getElementById('img-modal');
    if (modal && imgModal) {
        imgModal.src = src;
        modal.classList.remove('escondido');
    }
}

//Fecha a imagem
function fecharModal() {
    const modal = document.getElementById('modal-foto');
    if (modal) {
        modal.classList.add('escondido');
    }
}

