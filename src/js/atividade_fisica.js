document.addEventListener('DOMContentLoaded', function () {
    // Chama a funcao global verificarUser
    const idDoUtilizadorLogado = verificarEObterUtilizadorId();

    // Se não for valido a funcao global já o expulsou e terminamos o codigo aqui
    if (!idDoUtilizadorLogado) return;

    // Elemento de boas-vindas
    const eleBoasVindas = document.getElementById('nome-utilizador-boas-vindas');
    if (eleBoasVindas) {
        eleBoasVindas.textContent = localStorage.getItem('sessao_ativa');
    }

    //Carrega as atividades físicas
    carregarAtividades(idDoUtilizadorLogado);

    // Carrega as sugestões da lista aninhada diretamente no select do formulário
    carregarSugestoesAtividades();

    //Formulário para adicionar novas atividades
    const formAtividade = document.getElementById('form-nova-atividade');
    formAtividade.addEventListener('submit', function (e) {
        e.preventDefault();

        //lê o html (campo input) à procura da foto
        const fotoInput = document.getElementById('act-foto');
        
        //Verifica se existe pelo menos uma foto selecionada
        if (fotoInput.files && fotoInput.files[0]) {
            //Cria um leitor
            const leitor = new FileReader();
            leitor.onload = function (evento) {
                //Grava os dados da refeicao e passa também a foto já convertida
                gravarDadosAtividade(idDoUtilizadorLogado, evento.target.result);
            };
            //Converte a foto para formato de texto
            leitor.readAsDataURL(fotoInput.files[0]);
        } else {
            //Senao, grava sem foto, apenas uma padrão
            gravarDadosAtividade(idDoUtilizadorLogado, 'imagens/placeholder.jpg');
        }
    });
});

function gravarDadosAtividade(userId, fotoUrl) {
    const novaAct = {
        utilizador_id: userId,
        tipo: document.getElementById('act-tipo').value,
        data: document.getElementById('act-data').value,
        local: document.getElementById('act-local').value,
        distancia_tempo: document.getElementById('act-metricas').value,
        calorias: document.getElementById('act-calorias').value,
        observacoes: document.getElementById('act-notas').value,
        foto: fotoUrl
    };

    const atividadesLocais = JSON.parse(localStorage.getItem('atividades_locais_json')) || [];
    atividadesLocais.push(novaAct);
    localStorage.setItem('atividades_locais_json', JSON.stringify(atividadesLocais));

    document.getElementById('form-nova-atividade').reset();
    carregarAtividades(userId);
}

async function carregarAtividades(userId) {
    const boxAtividades = document.getElementById('contentor-atividades');
    
    try {
        const resposta = await fetch('xml/dados.xml');
        if (!resposta.ok) throw new Error('Ficheiro XML não encontrado.');
        
        //Converter o ficheiro em codigo legivel
        const textoXml = await resposta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textoXml, "text/xml");
        
        //Encontrar o alvo, neste caso atividades dentro do XML
        const listaAtividadesXml = xmlDoc.getElementsByTagName('atividade');
        let encontrouAtividades = false;
        
        let htmlAtividades = `
            <div class="tabela-wrapper">
                <table class="tabela-registos">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Local</th>
                            <th>Métricas</th>
                            <th>Gasto</th>
                            <th>Notas</th>
                            <th>Fotos</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Para cada atividade dentro da lista XML
        for (let atividade of listaAtividadesXml) {
            const utilizadorIdXml = activity = atividade.getElementsByTagName('utilizador_id')[0].textContent;
            
            //Se o user for = ao UserID do XML
            if (parseInt(utilizadorIdXml) === userId) {
                encontrouAtividades = true;
                
                // Apanha os dados do XML
                const data = atividade.getElementsByTagName('data')[0].textContent;
                const tipo = atividade.getElementsByTagName('tipo')[0].textContent;
                const local = atividade.getElementsByTagName('local')[0].textContent;
                const distTempo = atividade.getElementsByTagName('distancia_tempo')[0].textContent;
                const calorias = atividade.getElementsByTagName('calorias')[0].textContent;
                const observacoes = atividade.getElementsByTagName('observacoes')[0].textContent;
                
                const fotosNodes = atividade.getElementsByTagName('foto');
                let fotosHtml = '';
                for (let i = 0; i < fotosNodes.length; i++) {
                    fotosHtml += `<img src="${fotosNodes[i].textContent}" class="foto-tabela" alt="Foto" onclick="abrirModal(this.src)">`;
                }
                
                htmlAtividades += `
                    <tr>
                        <td><span class="tag-tipo">${tipo}</span></td>
                        <td>${data}</td>
                        <td>${local}</td>
                        <td>${distTempo}</td>
                        <td>${calorias} kcal</td>
                        <td>${observacoes}</td>
                        <td><div class="galeria-tabela">${fotosHtml}</div></td>
                    </tr>
                `;
            }
        }

        //Atividades via LocalStorage
        const atividadesLocais = JSON.parse(localStorage.getItem('atividades_locais_json')) || [];
        let filtradasLocal = [];

        //Percorrer todas as atividades que estão no LocalStorage
        for (let i = 0; i < atividadesLocais.length; i++) {
            if (atividadesLocais[i].utilizador_id === userId) {
                filtradasLocal.push(atividadesLocais[i]);
            }
        }

        for (let act of filtradasLocal) {
            encontrouAtividades = true;
            htmlAtividades += `
                <tr>
                    <td><span class="tag-tipo">${act.tipo}</span></td>
                    <td>${act.data}</td>
                    <td>${act.local}</td>
                    <td>${act.distancia_tempo}</td>
                    <td>${act.calorias} kcal</td>
                    <td>${act.observacoes}</td>
                    <td><div class="galeria-tabela"><img src="${act.foto}" class="foto-tabela" alt="Foto" onclick="abrirModal(this.src)"></div></td>
                </tr>
            `;
        }

        htmlAtividades += `</tbody></table></div>`;
        
        if (encontrouAtividades) {
            boxAtividades.innerHTML = htmlAtividades;
        } else {
            boxAtividades.innerHTML = '<p>Ainda não tens atividades físicas registadas.</p>';
        }
        
    } catch (err) {
        console.error(err);
        boxAtividades.innerHTML = '<p>Erro ao carregar as atividades.</p>';
    }
}

//carrega as sugestões do formulário
async function carregarSugestoesAtividades() {
    const alvo = document.getElementById('act-tipo');
    if (!alvo) return;

    try {
        // procura e lê o ficheiro XML de dados
        const respuesta = await fetch('xml/dados.xml');
        const textoXml = await respuesta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textoXml, "text/xml");


         // isola a secção com sugestoes de refeicao para evitar conflitos com desporto
        const categorias = xmlDoc.getElementsByTagName('sugestoes_atividades')[0].getElementsByTagName('categoria');
        let htmlSelect = '<option value="" disabled selected>Selecione o momento</option>';


        //percorre as categorias do xml
        for (let cat of categorias) {
            const nomeCategoria = cat.getAttribute('nome');
            //Titulo da categoria não clicavél
            htmlSelect += `<optgroup label="${nomeCategoria}">`;
            
            // adiciona as opções de desporto de cada categoria
            const opcoes = cat.getElementsByTagName('opcao');
            for (let op of opcoes) {
                htmlSelect += `<option value="${op.textContent}">${op.textContent}</option>`;
            }
            //fecha a categoria
            htmlSelect += '</optgroup>';
        }

        alvo.innerHTML = htmlSelect;

    } catch (err) {
        console.error(err);
    }
}