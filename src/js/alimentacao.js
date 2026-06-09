document.addEventListener('DOMContentLoaded', function () {
    // Chama a funcao global verificarUser
    const idDoUtilizadorLogado = verificarEObterUtilizadorId();

    // Se não for valido a funcao global já o expulsou e terminamos o codigo aqui
    if (!idDoUtilizadorLogado) return;

    // Carrega as refeicoes para o ID correto
    carregarRefeicoes(idDoUtilizadorLogado);

    // Carrega os momentos de refeição do XML para o select
    carregarSugestoesRefeicoes();

    // Formulário para adicionar refeições
    const formRefeicao = document.getElementById('form-nova-refeicao');
    //Apanha o formulário
    formRefeicao.addEventListener('submit', function (e) {
        e.preventDefault();

        //lê o html (campo input) à procura da foto
        const fotoInput = document.getElementById('ref-foto');
        //Verifica se existe pelo menos uma foto selecionada
        if (fotoInput.files && fotoInput.files[0]) {
            //Cria um leitor
            const leitor = new FileReader();
            leitor.onload = function (evento) {
                //Grava os dados da refeicao e passa também a foto já convertida
                gravarDadosRefeicao(idDoUtilizadorLogado, evento.target.result);
            };
            //Converte a foto para formato de texto
            leitor.readAsDataURL(fotoInput.files[0]);
        } else {
            //Senao, grava sem foto, apenas uma padrão
            gravarDadosRefeicao(idDoUtilizadorLogado, 'imagens/placeholder.jpg');
        }
    });
});

//Grava os dados de um novo formulário
function gravarDadosRefeicao(userId, fotoUrl) {
    const novaRef = {
        utilizador_id: userId,
        tipo: document.getElementById('ref-tipo').value,
        data: document.getElementById('ref-data').value,
        titulo: document.getElementById('ref-titulo').value,
        calorias: document.getElementById('ref-calorias').value,
        proteinas: document.getElementById('ref-proteinas').value,
        foto_prato: fotoUrl
    };
    
    //Obtem o JSON já guardado em localStorage e faz push da nova alimentação
    const refeicoesLocais = JSON.parse(localStorage.getItem('refeicoes_locais_json')) || [];
    refeicoesLocais.push(novaRef);
    localStorage.setItem('refeicoes_locais_json', JSON.stringify(refeicoesLocais));

    //reset aos campos do formulário
    document.getElementById('form-nova-refeicao').reset();
    carregarRefeicoes(userId);
}

//Carrega as refeicoes
async function carregarRefeicoes(userId) {
    const boxRefeicoes = document.getElementById('contentor-refeicoes');

    try {
        const resposta = await fetch('xml/dados.xml');
        if (!resposta.ok) throw new Error('Ficheiro XML não encontrado.');

        //Converter o ficheiro em codigo legivel
        const textoXml = await resposta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textoXml, "text/xml");

        //Encontrar o alvo, neste caso refeicoes dentro do XML
        const listaRefeicoesXml = xmlDoc.getElementsByTagName('refeicao');
        let encontrouRefeicoes = false;
        
        //define os limites da tabela para não criar algo a mais do que apenas uma nova linha
        let htmlRefeicoes = `
            <div class="tabela-wrapper">
                <table class="tabela-registos">
                    <thead>
                        <tr>
                            <th>Refeição</th>
                            <th>Data</th>
                            <th>Prato</th>
                            <th>Calorias</th>
                            <th>Proteínas</th>
                            <th>Foto</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        //Para cada refeicao dentro da lista XML
        for (let refeicao of listaRefeicoesXml) {
            const utilizadorIdXml = refeicao.getElementsByTagName('utilizador_id')[0].textContent;
            //Se o user for = ao UserID do XML
            if (parseInt(utilizadorIdXml) === userId) {
                encontrouRefeicoes = true;

                //Apanha os dados do XML
                const data = refeicao.getElementsByTagName('data')[0].textContent;
                const tipo = refeicao.getElementsByTagName('tipo')[0].textContent;
                const titulo = refeicao.getElementsByTagName('titulo')[0].textContent;
                const fotoPrato = refeicao.getElementsByTagName('foto_prato')[0].textContent;

                const nutrientesNode = refeicao.getElementsByTagName('nutrientes')[0];
                const cal = nutrientesNode.getElementsByTagName('calorias')[0].textContent;
                const prot = nutrientesNode.getElementsByTagName('proteinas')[0].textContent;
                
                //Cria uma nova <tr> table row a cada ciclo do for
                htmlRefeicoes += `
                    <tr>
                        <td><span class="tag-tipo tag-refeicao">${tipo}</span></td>
                        <td>${data}</td>
                        <td>${titulo}</td>
                        <td>${cal}</td>
                        <td>${prot}</td>
                        <td><img src="${fotoPrato}" class="foto-tabela" alt="Prato" onclick="abrirModal(this.src)"></td>
                    </tr>
                `;
            }
        }

        //Refeicoes via LocalStorage
        const refeicoesLocais = JSON.parse(localStorage.getItem('refeicoes_locais_json')) || [];
        let filtradasLocal = [];

        // Percorrer todas as refeições que estão no LocalStorage
        for (let i = 0; i < refeicoesLocais.length; i++) {
            if (refeicoesLocais[i].utilizador_id === userId) {
                filtradasLocal.push(refeicoesLocais[i]);
            }
        }

        for (let ref of filtradasLocal) {
            encontrouRefeicoes = true;

            //Cria uma nova <tr> table row a cada ciclo do for
            htmlRefeicoes += `
                <tr>
                    <td><span class="tag-tipo tag-refeicao">${ref.tipo}</span></td>
                    <td>${ref.data}</td>
                    <td>${ref.titulo}</td>
                    <td>${ref.calorias}</td>
                    <td>${ref.proteinas}</td>
                    <td><img src="${ref.foto_prato}" class="foto-tabela" alt="Prato" onclick="abrirModal(this.src)"></td>
                </tr>
            `;
        }

        //Depois dos ciclos for, fecha a tabela
        htmlRefeicoes += `</tbody></table></div>`;

        //Mostra a tabela ou então a mensagem default
        if (encontrouRefeicoes) {
            boxRefeicoes.innerHTML = htmlRefeicoes;
        } else {
            boxRefeicoes.innerHTML = '<p>Ainda não tens refeições registadas.</p>';
        }

    } catch (err) {
        console.error(err);
        boxRefeicoes.innerHTML = '<p>Erro ao carregar as refeições.</p>';
    }
}

//carrega as sugestões do formulário
async function carregarSugestoesRefeicoes() {
    const alvo = document.getElementById('ref-tipo');
    if (!alvo) return;

    try {
        // procura e lê o ficheiro XML de dados
        const resposta = await fetch('xml/dados.xml');
        const textoXml = await resposta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textoXml, "text/xml");
        
        // isola a secção com sugestoes de refeicao para evitar conflitos com desporto
        const categorias = xmlDoc.getElementsByTagName('sugestoes_refeicoes')[0].getElementsByTagName('categoria');
        let htmlSelect = '<option value="" disabled selected>Selecione o momento</option>';

        //percorre as categorias do xml
        for (let cat of categorias) {
            const nomeCategoria = cat.getAttribute('nome');
            //Titulo da categoria não clicavél
            htmlSelect += `<optgroup label="${nomeCategoria}">`;
            
            // adiciona as opções de alimentos de cada categoria
            const opcoes = cat.getElementsByTagName('opcao');
            for (let op of opcoes) {
                htmlSelect += `<option value="${op.textContent}">${op.textContent}</option>`;
            }
            //fecha a categoria
            htmlSelect += '</optgroup>';
        }

        // injeta as opções estruturadas no elemento select do HTML
        alvo.innerHTML = htmlSelect;

    } catch (err) {
        console.error(err);
    }
}