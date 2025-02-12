// Função para registrar o usuário no localStorage e API
function registrarUsuario(event) {
    // Evitar comportamento padrão do formulário
    event.preventDefault();

    // Obter valores dos campos
    const email = document.getElementById("email").value;
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    // Validar se a senha e a confirmação são iguais
    if (senha !== confirmarSenha) {
        alert("As senhas não correspondem. Tente novamente.");
        return; // Retorna se as senhas não corresponderem
    }

    // Verificar se o nome de usuário já existe no localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []; // Recupera ou cria o array de usuários
    if (usuarios.some(usuarioRegistrado => usuarioRegistrado.nome === usuario)) {
        alert("Este nome de usuário já existe.");
        return;
    }

    // Enviar dados para a API (opcional, se necessário)
    fetch('https://fakestoreapi.com/users', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            username: usuario,
            password: senha
        })
    })
    .then(res => res.json())
    .then(json => {
        console.log("Usuário registrado na API:", json);

        // Atribuindo cargo ao usuário (definindo o primeiro usuário como "administrador")
        const cargo = usuarios.length === 0 ? "administrador" : "cliente"; // O primeiro usuário será administrador

        // Adicionar novo usuário ao array de usuários
        usuarios.push({
            nome: usuario,
            email: email,
            senha: senha,
            cargo: cargo
        });

        // Salvar os dados de usuários no localStorage
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        alert("Registro realizado com sucesso!");
        document.getElementById("formRegistro").reset(); // Limpa o formulário após o registro
    })
    .catch(error => {
        console.error("Erro ao registrar o usuário:", error);
        alert("Erro ao registrar. Tente novamente mais tarde.");
    });
}

// Função para voltar ao formulário de login
function cancelarRegistro() {
    // Código para navegar de volta ao formulário de login (pode ser alterado conforme a estrutura do seu projeto)
    window.location.href = "index.html"; // Substitua com a URL do seu formulário de login
}


// Função para efetuar o login
function efetuarLogin() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    // Verificar se os campos estão preenchidos
    if (!usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Envia a requisição para a API de autenticação
    fetch('https://fakestoreapi.com/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usuario,
            password: senha
        })
    })
    .then(res => res.json())
    .then(json => {
        // Verifica se o token está presente na resposta
        if (json.token) {
            localStorage.setItem("usuarioLogado", JSON.stringify({
                nome: usuario,
                token: json.token
            }));

            // Esconde o formulário de login e mostra as áreas do sistema
            alert('Login Efetuado com sucesso!');

            // Libera painel de administrador ou catálogo para cliente
            window.location.href = "painelAdmin.html";
            window.location.href = "catalogo.html";
        } else {
            alert('Usuário ou senha estão incorretos...');
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Erro ao autenticar o usuário.');
    });
};

function acessarRecursoProtegido() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || !usuarioLogado.token) {
        alert("Você não está autenticado!");
        return;
    };

    const token = usuarioLogado.token;

    fetch('https://fakestoreapi.com/protected-resource', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(json => {
        console.log("Dados do recurso protegido:", json);
    })
    .catch(error => {
        console.error('Erro ao acessar o recurso protegido:', error);
    });
};

function efetuarLogout() {
    localStorage.removeItem("usuarioLogado");
    formularioLogin.classList.remove("d-none");

    formularioNovosProdutos.classList.add("d-none");
    formularioCatalogo.classList.add("d-none");

    alert('Você foi desconectado.');
};

let formularioLogin = document.getElementById("formularioLogin");
let formularioRegistro = document.getElementById("formularioRegistro");
let formularioNovosProdutos = document.getElementById("formularioNovosProdutos");
let formularioCatalogo = document.getElementById("formularioCatalogo");
let resumoDoCarrinho = document.getElementById("resumoDoCarrinho");

/* Função para mostrar o formulario de registro */
function mostrarFormularioRegistro() {
    formularioLogin.classList.add("d-none");
    formularioRegistro.classList.remove("d-none");
}

/* Função para cancelar o registro */
function cancelarRegistro() {
    formularioLogin.classList.remove("d-none");
    formularioRegistro.classList.add("d-none");
}

// Função para adicionar novos produtos
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function adicionarProduto() {
    const nomeDoProduto = document.getElementById("nomeDoProduto").value;
    const descricaoDoProduto = document.getElementById("descricaoDoProduto").value;
    const precoDoProduto = document.getElementById("precoDoProduto").value;
    const statusDoProduto = document.getElementById("statusDoProduto").value;

    // Verificar campos vazios
    if (!nomeDoProduto || !descricaoDoProduto || !precoDoProduto || !statusDoProduto) {
        alert("Por favor, preencha todos os campos do produto.");
        return;
    }

    if (precoDoProduto <= 0 || isNaN(precoDoProduto)) {
        alert("Por favor, insira um preço válido.");
        return;
    }


    // Modificando o status
    let statusDoProdutoTexto = statusDoProduto === "1" ? {
        texto: "Disponível",
        classe: "statusGreen"
    } : {
        texto: "Indisponível",
        classe: "statusRed"
    };

    // Criando o novo produto
    const novoProduto = {
        nome: nomeDoProduto,
        descricao: descricaoDoProduto,
        preco: precoDoProduto,
        disponibilidade: statusDoProdutoTexto
    };

    // Adicionar o novo produto à lista
    produtos.push(novoProduto);

    // Salvar a lista de produtos no localStorage
    localStorage.setItem("produtos", JSON.stringify(produtos));

    // Atualizar a lista de produtos na tela
    exibirProdutos();

    // Limpar os campos do formulário
    document.getElementById("nomeDoProduto").value = '';
    document.getElementById("descricaoDoProduto").value = '';
    document.getElementById("precoDoProduto").value = '';
    document.getElementById("statusDoProduto").value = '';
}

// Função para exibir a lista de produtos
function exibirProdutos() {
    const listaDeProdutosNovos = document.getElementById("listaDeProdutosNovos");
    listaDeProdutosNovos.innerHTML = '';

    // Adicionar os produtos armazenados no localStorage à lista
    produtos.forEach((produto, index) => {
        const item = document.createElement("div");
        item.classList.add("col-12", "col-md-6", "col-lg-3", "mb-4");

        // Adicionando o conteúdo do produto
        item.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p class="card-text"><strong>Descrição:</strong> ${produto.descricao}</p>
                    <p class="card-text"><strong>Preço:</strong> R$ ${produto.preco}</p>
                    <p class="card-text">
                        <strong>Status:</strong> 
                        <span class="status ${produto.disponibilidade.classe}">${produto.disponibilidade.texto}</span>
                    </p>
                </div>
            </div>
        `;


        // Botão "Editar"
        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.onclick = () => editarProduto(index);

        // Botão "Excluir"
        const excluirBtn = document.createElement('button');
        excluirBtn.textContent = 'Excluir';
        excluirBtn.style.backgroundColor = 'red';
        excluirBtn.onclick = () => excluirProduto(index);

        localStorage.setItem("produtos", JSON.stringify(produtos));

        item.appendChild(editarBtn);
        item.appendChild(excluirBtn);

        listaDeProdutosNovos.appendChild(item);
    });
}

// Editar um produto
function editarProduto(index) {
    const produto = produtos[index];
    const nome = prompt('Editar nome:', produto.nome);
    const descricao = prompt('Editar descrição:', produto.descricao);
    const preco = prompt('Editar preço:', produto.preco);
    const disponibilidade = prompt('Editar disponibilidade:', produto.disponibilidade.texto);

    if (nome && descricao && preco && disponibilidade) {
        produtos[index] = {
            nome,
            descricao,
            preco,
            disponibilidade: {
                texto: disponibilidade,
                classe: disponibilidade === "Disponível" ? "statusGreen" : "statusRed"
            }
        };
        exibirProdutos();
    }
}

// Excluir um produto
function excluirProduto(index) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        produtos.splice(index, 1);
        exibirProdutos();
    }
}

// Carregar a lista de produtos
if (formularioNovosProdutos) {
    exibirProdutos();
}

function exibirCatalogo() {
    const listaDeProdutosCatalogo = document.getElementById("listaDeProdutosCatalogo");
    listaDeProdutosCatalogo.innerHTML = "";


    // Adicionar os produtos ao catálogo
    produtos.forEach(produto => {
        const item = document.createElement("div");
        item.classList.add("col-md-12", "col-lg-4", "mb-4");

        item.innerHTML = `<div class="card">
            <div class="card-body">
                <h5 class="card-title">${produto.nome}</h5>
                <p class="card-text"><strong>Descrição:</strong> ${produto.descricao}</p>
                <p class="card-text"><strong>Preço:</strong> R$ ${produto.preco}</p>
                <p class="card-text">
                    <strong>Status:</strong> 
                    <span class="status ${produto.disponibilidade.classe}">${produto.disponibilidade.texto}</span>
                </p>
                <p class="card-text">
                    <strong>Quantidade:</strong> 
                    <input type="number" name="quantidade" class="card-text" placeholder="Informe a quantidade que deseja" min="1"/>
                </p>
                <button class="btn btn-primary" onclick="adicionarAoCarrinho('${produto.nome}', event)">Adicionar ao Carrinho</button>
            </div>
        </div>`;

        formularioCatalogo.appendChild(item);
    });
}

// Função para adicionar ao carrinho
function adicionarAoCarrinho(nomeProduto, event) {
    // Encontre o campo de quantidade mais próximo do botão de adicionar ao carrinho
    const quantidadeInput = event.target.closest(".card-body").querySelector("input[name='quantidade']");
    const quantidade = parseInt(quantidadeInput.value); // Converte a quantidade para inteiro

    // Verificar se a quantidade é um número válido
    if (isNaN(quantidade) || quantidade <= 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
    }

    // Encontrar o produto correspondente
    const produto = produtos.find(p => p.nome === nomeProduto);

    // Verificar se o produto está disponível
    if (produto.disponibilidade.texto === "Indisponível") {
        alert(`O produto ${nomeProduto} está indisponível e não pode ser adicionado ao carrinho.`);
        return;
    }

    // Carregar o carrinho do localStorage
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    // Verificar se o produto já está no carrinho
    const produtoNoCarrinho = carrinho.find(item => item.produto.nome === produto.nome);

    if (produtoNoCarrinho) {
        produtoNoCarrinho.quantidade += quantidade; // Adiciona a quantidade ao produto existente
    } else {
        carrinho.push({
            produto,
            quantidade
        });
    }

    // Salvar carrinho no localStorage
    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    alert(`Produto ${nomeProduto} adicionado ao carrinho!`);

    // Atualizar o resumo do carrinho
    exibirResumoCarrinho();
}

// Função para exibir o resumo do carrinho
function exibirResumoCarrinho() {
    const resumoDoCarrinho = document.getElementById("resumoDoCarrinho");
    resumoDoCarrinho.innerHTML = ''; // Limpar o conteúdo anterior

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (carrinho.length === 0) {
        resumoDoCarrinho.innerHTML = "<p>Seu carrinho está vazio.</p>";
        return;
    }

    let total = 0;

    // Exibir os produtos no carrinho
    carrinho.forEach(item => {
        const produto = item.produto;
        const quantidade = item.quantidade;
        total += produto.preco * quantidade;

        const itemCarrinho = document.createElement("div");
        itemCarrinho.classList.add("resumoProduto");

        itemCarrinho.innerHTML = `
            <p><strong>${produto.nome}</strong> - ${quantidade} x R$ ${produto.preco}</p>
            <p>R$ ${(produto.preco * quantidade).toFixed(2)}</p>
        `;

        resumoDoCarrinho.appendChild(itemCarrinho);
    });

    // Exibir o total
    const totalElemento = document.createElement("div");
    totalElemento.innerHTML = `<p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>`;

    resumoDoCarrinho.appendChild(totalElemento);

    // Exibir o botão de finalizar compra
    const finalizarCompraBtn = document.createElement("button");
    finalizarCompraBtn.textContent = "Finalizar Compra";
    finalizarCompraBtn.onclick = finalizarCompra;
    resumoDoCarrinho.appendChild(finalizarCompraBtn);
}

// Função para finalizar a compra e enviar notificação
async function finalizarCompra() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    // Finalizar a compra, limpar o carrinho
    localStorage.removeItem("carrinho");

    // Obter o e-mail do usuário logado
    const email = localStorage.getItem("usuarioLogadoEmail");

    // Enviar notificação via Pushover
    const mensagem = "Seu pedido foi confirmado! Acompanhe o status do envio.";

    try {
        await enviarNotificacaoPushover(mensagem);
        alert("Compra finalizada com sucesso! Notificação enviada.");
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        alert("Compra finalizada, mas ocorreu um erro ao enviar a notificação.");
    };

    // Atualizar o resumo do carrinho (ficará vazio)
    exibirResumoCarrinho();
};

// Função para enviar notificação via Pushover
async function enviarNotificacaoPushover(mensagem) {
    const userKey = 'ur8q36wd37nwzysnoxvw8634w8ieug'; // Substitua pela sua User Key
    const apiToken = 'ar8spu9aocqt1xycjyfhmpm2mdpexv'; // Substitua pelo seu API Token

    const url = 'https://api.pushover.net/1/messages.json';
    

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                token: apiToken,
                user: userKey,
                message: mensagem,
            }),
        });


        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Notificação enviada com sucesso:', data);
        return data; // Retorna os dados da resposta para uso posterior
    } catch (error) {
        console.error('Erro ao enviar notificação:', error.message);
        throw error; // Lança o erro para ser tratado pela função que chamou
    };
};