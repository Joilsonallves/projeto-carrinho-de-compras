// Função para carregar o EmailJS dinamicamente
function carregarEmailJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            console.log('EmailJS carregado com sucesso!');
            resolve();
        };
        script.onerror = () => {
            console.error('Erro ao carregar EmailJS.');
            reject(new Error('Erro ao carregar EmailJS.'));
        };
        document.head.appendChild(script);
    });
}

// Inicializa o EmailJS após carregar o script
async function inicializarEmailJS() {
    try {
        await carregarEmailJS();
        emailjs.init('fVYL5gjVvG4xj8HM2'); // Substitua pela sua chave pública do EmailJS
    } catch (error) {
        console.error('Erro ao inicializar EmailJS:', error);
        throw error;
    }
}

// Função para carregar dados do localStorage
function carregarDados(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
}

// Função para salvar dados no localStorage
function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

// Função para registrar um novo usuário
function registrarUsuario() {
    const usuario = document.getElementById('usuario').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const cargo = document.getElementById('cargo').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    const usuarios = carregarDados('usuarios');

    // Verificar se o usuário já existe
    const usuarioExistente = usuarios.find(u => u.usuario === usuario);
    if (usuarioExistente) {
        alert('Usuário já cadastrado!');
        return;
    }

    // Adicionar novo usuário
    usuarios.push({ usuario, email, senha, cargo });
    salvarDados('usuarios', usuarios);

    alert('Usuário registrado com sucesso!');
    window.location.href = '../index.html'; // Redirecionar para a página de login
}

// Função para efetuar login
function efetuarLogin() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    const usuarios = carregarDados('usuarios');

    // Verificar se o usuário e senha estão corretos
    const usuarioLogado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (usuarioLogado) {
        alert('Login efetuado com sucesso!');

        // Salvar o usuário logado no localStorage com chaves diferentes
        if (usuarioLogado.cargo === 'administrador') {
            localStorage.setItem('usuarioLogadoAdmin', JSON.stringify(usuarioLogado));
            localStorage.removeItem('usuarioLogadoCliente'); // Limpar cliente, se existir
            window.location.href = 'paginas/painelAdmin.html'; // Painel de administração
        } else {
            localStorage.setItem('usuarioLogadoCliente', JSON.stringify(usuarioLogado));
            localStorage.removeItem('usuarioLogadoAdmin'); // Limpar admin, se existir
            window.location.href = 'paginas/catalogo.html'; // Catálogo de produtos
        }
    } else {
        alert('Usuário ou senha incorretos!');
    }
}

// Função para efetuar logout
function efetuarLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = '../index.html';
}

// Função para exibir o formulário de registro
function exibirFormularioRegistro() {
    window.location.href = 'paginas/registro.html';
}

// Função para cancelar o registro
function cancelarRegistro() {
    window.location.href = '../index.html';
}

// Função para adicionar um novo produto
function adicionarProduto() {
    const nome = document.getElementById('nomeDoProduto').value;
    const descricao = document.getElementById('descricaoDoProduto').value;
    const preco = parseFloat(document.getElementById('precoDoProduto').value);
    const status = document.getElementById('statusDoProduto').value;

    if (!nome || !descricao || !preco || !status) {
        alert('Preencha todos os campos!');
        return;
    }

    const produtos = carregarDados('produtos');
    const novoProduto = {
        id: Date.now(), // Usar timestamp para garantir IDs únicos
        nome,
        descricao,
        preco,
        disponivel: status === '1'
    };

    produtos.push(novoProduto);
    salvarDados('produtos', produtos);
    alert('Produto adicionado com sucesso!');
    carregarListaDeProdutos(); // Atualizar a lista de produtos no painel admin
}

// Função para carregar a lista de produtos no painel de administração
function carregarListaDeProdutos() {
    const produtos = carregarDados('produtos');
    const listaDeProdutosNovos = document.getElementById('listaDeProdutosNovos');
    listaDeProdutosNovos.innerHTML = '';

    produtos.forEach(produto => {
        const produtoDiv = document.createElement('div');
        produtoDiv.className = 'col-md-4 mb-3';
        produtoDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p class="card-text">${produto.descricao}</p>
                    <p class="card-text">Preço: R$ ${produto.preco.toFixed(2)}</p>
                    <p class="card-text">Status: ${produto.disponivel ? 'Disponível' : 'Indisponível'}</p>
                    <button class="btn btn-primary" onclick="editarProduto(${produto.id})">Editar</button>
                    <button class="btn btn-danger mt-2" onclick="removerProduto(${produto.id})">Remover</button>
                </div>
            </div>
        `;
        listaDeProdutosNovos.appendChild(produtoDiv);
    });
}

// Função para editar o produto
function editarProduto(id) {
    const produtos = carregarDados('produtos');
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }

    // Criar formulário de edição
    const formularioEdicao = document.createElement('div');
    formularioEdicao.innerHTML = `
        <h3>Editar Produto</h3>
        <label>Nome:</label>
        <input type="text" id="editarNome" value="${produto.nome}">
        <label>Descrição:</label>
        <input type="text" id="editarDescricao" value="${produto.descricao}">
        <label>Preço:</label>
        <input type="number" id="editarPreco" value="${produto.preco}">
        <label>Status:</label>
        <select id="editarStatus">
            <option value="1" ${produto.disponivel ? 'selected' : ''}>Disponível</option>
            <option value="0" ${!produto.disponivel ? 'selected' : ''}>Indisponível</option>
        </select>
        <button class="btn btn-success" onclick="salvarEdicao(${produto.id})">Salvar</button>
        <button class="btn btn-secondary" onclick="cancelarEdicao()">Cancelar</button>
    `;

    // Exibir formulário de edição
    const listaDeProdutosNovos = document.getElementById('listaDeProdutosNovos');
    listaDeProdutosNovos.innerHTML = ''; // Limpar a lista de produtos
    listaDeProdutosNovos.appendChild(formularioEdicao);
}

// Função para salvar as alterações do produto
function salvarEdicao(id) {
    const nome = document.getElementById('editarNome').value;
    const descricao = document.getElementById('editarDescricao').value;
    const preco = parseFloat(document.getElementById('editarPreco').value);
    const status = document.getElementById('editarStatus').value;

    if (!nome || !descricao || !preco || !status) {
        alert('Preencha todos os campos!');
        return;
    }

    const produtos = carregarDados('produtos');
    const produtoIndex = produtos.findIndex(p => p.id === id);

    if (produtoIndex === -1) {
        alert('Produto não encontrado!');
        return;
    }

    // Atualizar os dados do produto
    produtos[produtoIndex] = {
        ...produtos[produtoIndex],
        nome,
        descricao,
        preco,
        disponivel: status === '1'
    };

    salvarDados('produtos', produtos);
    alert('Produto atualizado com sucesso!');
    carregarListaDeProdutos(); // Atualizar a lista de produtos
}

// Função para cancelar a edição
function cancelarEdicao() {
    carregarListaDeProdutos(); // Voltar à exibição normal da lista de produtos
}

// Função para remover um produto
function removerProduto(id) {
    let produtos = carregarDados('produtos');
    produtos = produtos.filter(produto => produto.id !== id);
    salvarDados('produtos', produtos);
    carregarListaDeProdutos(); // Atualizar a lista de produtos
}

// Função para carregar o catálogo de produtos
function carregarCatalogo() {
    const produtos = carregarDados('produtos');
    const catalogoDiv = document.getElementById('catalogo');
    catalogoDiv.innerHTML = '';

    produtos.forEach(produto => {
        if (produto.disponivel) {
            const produtoDiv = document.createElement('div');
            produtoDiv.className = 'produto';
            produtoDiv.innerHTML = `
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
            `;
            catalogoDiv.appendChild(produtoDiv);
        }
    });
}

// Função para adicionar um produto ao carrinho
function adicionarAoCarrinho(id) {
    const produtos = carregarDados('produtos');
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }

    const carrinho = carregarDados('carrinho');
    const itemExistente = carrinho.find(item => item.id === id);

    // Obtém o e-mail do cliente logado
    const usuarioLogadoCliente = JSON.parse(localStorage.getItem('usuarioLogadoCliente'));
    if (!usuarioLogadoCliente) {
        alert('Cliente não está logado!');
        return;
    }

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        // Adiciona o e-mail do cliente ao item do carrinho
        carrinho.push({ ...produto, quantidade: 1, clienteEmail: usuarioLogadoCliente.email });
    }

    salvarDados('carrinho', carrinho);
    alert('Produto adicionado ao carrinho!');
}

// Função para exibir o carrinho de compras
function exibirCarrinho() {
    const carrinho = carregarDados('carrinho');
    const carrinhoDiv = document.getElementById('carrinho');
    carrinhoDiv.innerHTML = '';

    let total = 0;

    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-carrinho';
        itemDiv.innerHTML = `
            <h3>${item.nome}</h3>
            <p>Quantidade: ${item.quantidade}</p>
            <p>Preço unitário: R$ ${item.preco.toFixed(2)}</p>
            <p>Total: R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
            <button onclick="removerDoCarrinho(${item.id})">Remover</button>
        `;
        carrinhoDiv.appendChild(itemDiv);
        total += item.preco * item.quantidade;
    });

    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<h3>Total do Carrinho: R$ ${total.toFixed(2)}</h3>`;
    carrinhoDiv.appendChild(totalDiv);
}

// Função para remover um item do carrinho
function removerDoCarrinho(id) {
    let carrinho = carregarDados('carrinho');
    carrinho = carrinho.filter(item => item.id !== id);
    salvarDados('carrinho', carrinho);
    exibirCarrinho();
}

// Função para enviar e-mail
async function enviarEmail() {
    try {
        await inicializarEmailJS();
    } catch (error) {
        alert('Erro ao carregar EmailJS. Tente novamente.');
        return;
    }

    const carrinho = carregarDados('carrinho');
    if (carrinho.length === 0) {
        alert('Carrinho vazio!');
        return;
    }

    // Obtém o e-mail do cliente a partir do primeiro item do carrinho
    const clienteEmail = carrinho[0].clienteEmail;
    console.log('E-mail do cliente:', clienteEmail);

    if (!clienteEmail) {
        alert('E-mail do cliente não encontrado.');
        return;
    }

    const templateParams = {
        to_name: 'Cliente', // Você pode personalizar o nome
        to_email: clienteEmail,
        message: 'Sua compra foi finalizada com sucesso!'
    };

    console.log('Template Params:', templateParams);

    emailjs.send('service_hqb1eid', 'template_2cvpckf', templateParams) // Substitua pelo seu Service ID e Template ID
        .then(response => {
            console.log('E-mail enviado com sucesso!', response.status, response.text);
            alert('Notificação enviada por e-mail!');
        })
        .catch(error => {
            console.error('Erro ao enviar e-mail:', error);
            alert('Erro ao enviar notificação.');
        });
}

// Função para finalizar a compra
async function finalizarCompra() {
    const carrinho = carregarDados('carrinho');
    if (carrinho.length === 0) {
        alert('Carrinho vazio!');
        return;
    }

    // Enviar e-mail de notificação
    await enviarEmail();

    // Limpar carrinho
    localStorage.removeItem('carrinho');
    exibirCarrinho();
    alert('Compra finalizada com sucesso! Notificação enviada.');
}

// Inicialização
if (window.location.pathname.includes('paginas/painelAdmin.html')) {
    carregarListaDeProdutos();
} else if (window.location.pathname.includes('paginas/catalogo.html')) {
    carregarCatalogo();
} else if (window.location.pathname.includes('paginas/carrinho.html')) {
    exibirCarrinho();
}