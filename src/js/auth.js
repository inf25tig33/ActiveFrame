function mostrarLogin() {
    // Liga o botão Login e desliga o Registo
    document.getElementById('btn-login').classList.add('ativo');
    document.getElementById('btn-registo').classList.remove('ativo');

    // Mostra o Login e garante que o Registo fica escondido
    document.getElementById('form-login').classList.remove('escondido');
    document.getElementById('form-registo').classList.add('escondido');
}
function mostrarRegisto() {
    // Liga o botão Registo e desliga o Login
    document.getElementById('btn-registo').classList.add('ativo');
    document.getElementById('btn-login').classList.remove('ativo');

    // Mostra o Registo e garante que o Login fica escondido
    document.getElementById('form-registo').classList.remove('escondido');
    document.getElementById('form-login').classList.add('escondido');
}

//Desaparecer botão ao carregar fora
document.addEventListener('click', function (evento) {
    
    const zonaAutenticacao = document.querySelector('.botoes-form');
    
    if (zonaAutenticacao && !zonaAutenticacao.contains(evento.target)) {

        document.getElementById('form-login').classList.add('escondido');
        document.getElementById('form-registo').classList.add('escondido');

        document.getElementById('btn-login').classList.remove('ativo');
        document.getElementById('btn-registo').classList.remove('ativo');
    }
});

//JSON
document.addEventListener('DOMContentLoaded', async function () {
    //Tenta carregar dados do JSON local no localStorage
    if (!localStorage.getItem('utilizadores_json')) {
        try {

            const resposta = await fetch('json/utilizadores.json');

            if (!resposta.ok) {
                throw new Error('Ficheiro json/utilizadores.json não encontrado.');
            }

            const dadosIniciais = await resposta.json();

            localStorage.setItem('utilizadores_json', JSON.stringify(dadosIniciais));
            console.log('Utilizadores do JSON criados no localStorage');

        } catch (err) {
            console.warn('Nota: A iniciar com lista vazia ou ficheiro local indisponível:', err.message);
        }
    }

    const formRegisto = document.getElementById('form-registo');
    const formLogin = document.getElementById('form-login');

    // Criar conta + Adicionar user ao Json do LocalStorage
    if (formRegisto) {
        formRegisto.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const utilizador = document.getElementById('registo-user').value.trim();
            const email = document.getElementById('registo-email').value.trim();
            const password = document.getElementById('registo-pass').value;

            // Validação simples de tamanho de password
            if (password.length < 6) {
                alert('A palavra-passe deve ter pelo menos 6 caracteres.');
                return;
            }

            // Valida os utilizadores atuais
            let listaUtilizadores = JSON.parse(localStorage.getItem('utilizadores_json')) || [];

            // Evita duplicações de users
            let utilizadorExiste = false;
            for (let conta of listaUtilizadores) {
                if (conta.username.toLowerCase() === utilizador.toLowerCase()) {
                    utilizadorExiste = true;
                    break;
                }
            }
            //Mensagem de erro caso o user exista
            if (utilizadorExiste) {
                alert('Este nome de utilizador já está registado. Escolha outro.');
                return;
            }
            //Gerar o id
            let maiorId = 0;
            for (let conta of listaUtilizadores) {
                if (conta.id > maiorId) {
                    maiorId = conta.id;
                }
            }
            let proximoId = maiorId + 1;

            //Criar a conta
            const novoUtilizador = {
                id: proximoId,
                username: utilizador,
                email: email,
                password: password
            };

            //Adiciona-o ao array
            listaUtilizadores.push(novoUtilizador);

            //Atualiza o localStorage
            localStorage.setItem('utilizadores_json', JSON.stringify(listaUtilizadores));

            alert('Conta criada com sucesso! Já podes fazer login.');
            formRegisto.reset();
            mostrarLogin();
        });
    }

    //Fazer login
    if (formLogin) {
        formLogin.addEventListener('submit', function (evento) {
            evento.preventDefault();

            const userIntroduzido = document.getElementById('login-user').value.trim();
            const passIntroduzida = document.getElementById('login-pass').value;

            //Vamos buscar a string do localStorage
            const registoLocal = localStorage.getItem('utilizadores_json');

            //Convertemos para uma lista
            const listaUtilizadoresJSON = JSON.parse(registoLocal) || [];

            let loginSucesso = false;

            for (let conta of listaUtilizadoresJSON) {
                if (conta.username === userIntroduzido && conta.password === passIntroduzida) {
                    loginSucesso = true;
                    break;
                }
            }

            //Mensagem final
            if (loginSucesso) {
                localStorage.setItem('sessao_ativa', userIntroduzido);

                alert(`Login efetuado com sucesso! Bem-vindo, ${userIntroduzido}.`);

                window.location.href = 'atividade_fisica.html';
            } else {

                alert('Utilizador ou Palavra-passe incorretos. Tente novamente.');
            }
        });
    }

});