// Constantes para URLs da API
const API_URL = 'https://fakestoreapi.com';
const AFTERSHIP_API_URL = 'https://api.aftership.com/v4';
const AFTERSHIP_API_KEY = 'SUA_CHAVE_DE_API_AQUI'; // Substitua pela sua chave de API do AfterShip
const USUARIOS_LOCAIS_KEY = 'usuarios';
const USUARIO_LOGADO_KEY = 'usuarioLogado';

// Função para enviar notificação de confirmação de pedido via AfterShip
function enviarNotificacaoAfterShip(email, mensagem) {
    fetch(`${AFTERSHIP_API_URL}/notifications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'aftership-api-key': AFTERSHIP_API_KEY
        },
        body: JSON.stringify({
            notification: {
                emails: [email], // Lista de e-mails para notificação
                message: mensagem // Mensagem personalizada
            }
        })
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao enviar notificação.");
        return response.json();
    })
    .then(data => {
        console.log("Notificação enviada com sucesso:", data);
    })
    .catch(error => {
        console.error("Erro ao enviar notificação:", error);
    });
}

// Função para mostrar o formulário de registro
function mostrarFormularioRegistro() {
    window.location.href = "registro.html";
}

// Função para registrar novo usuário
function registrarUsuario(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const cargo = document.getElementById("cargo").value;

    // Validações
    if (!usuario || !email || !senha || !confirmarSenha || !cargo) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    if (!validarEmail(email)) {
        alert("Por favor, insira um email válido.");
        return;
    }

    const novoUsuario = {
        email,
        username: usuario,
        password: senha,
        cargo
    };

    // Registrar na API
    fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao registrar usuário.");
        return response.json();
    })
    .then(data => {
        alert(`Usuário registrado como ${cargo} com sucesso!`);

        // Salvar no localStorage
        const usuarios = JSON.parse(localStorage.getItem(USUARIOS_LOCAIS_KEY)) || [];
        usuarios.push(novoUsuario);
        localStorage.setItem(USUARIOS_LOCAIS_KEY, JSON.stringify(usuarios));

        // Redirecionar para login
        window.location.href = "index.html";
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao registrar usuário. Tente novamente.");
    });
}

// Função para efetuar login
function efetuarLogin() {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem(USUARIOS_LOCAIS_KEY)) || [];
    const usuarioEncontrado = usuarios.find(user => user.username === usuario && user.password === senha);

    if (!usuarioEncontrado) {
        alert("Usuário ou senha incorretos.");
        return;
    }

    // Salvar usuário logado
    localStorage.setItem(USUARIO_LOGADO_KEY, JSON.stringify({
        nome: usuarioEncontrado.username,
        cargo: usuarioEncontrado.cargo
    }));

    // Redirecionar
    if (usuarioEncontrado.cargo === "administrador") {
        window.location.href = "painelAdmin.html";
    } else {
        window.location.href = "catalogo.html";
    }
}

// Função para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}



// Função para acessar recurso protegido
function acessarRecursoProtegido() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || !usuarioLogado.token) {
        alert("Você não está autenticado!");
        return;
    }

    const token = usuarioLogado.token;

    fetch('https://fakestoreapi.com/protected-resource', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Erro ao acessar recurso protegido.");
        }
        return res.json();
    })
    .then(json => {
        console.log("Dados do recurso protegido:", json);
    })
    .catch(error => {
        console.error('Erro ao acessar o recurso protegido:', error);
    });
}

// Função para efetuar logout
function efetuarLogout() {
    localStorage.removeItem("usuarioLogado");
    alert("Você foi desconectado com sucesso.");
    window.location.href = "index.html"; // Redireciona para a página de login após logout
}



/* FUNÇÕES DO PAINEL ADMINISTRATIVO, PARA ADICIONAR, EDITAR E REMOVER PRODUTOS */

// Função para adicionar produto
// Função para adicionar produto (admin)
function adicionarProduto() {
    const nome = document.getElementById("nomeDoProduto").value.trim();
    const descricao = document.getElementById("descricaoDoProduto").value.trim();
    const preco = parseFloat(document.getElementById("precoDoProduto").value);
    const status = document.getElementById("statusDoProduto").value === "1";

    if (!nome || !descricao || isNaN(preco) || preco <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const produto = {
        title: nome,
        description: descricao,
        price: preco,
        availability: status
    };

    fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(data => {
        alert("Produto adicionado com sucesso!");
        exibirProdutos();
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao adicionar produto.");
    });
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(idProduto) {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const produto = produtos.find(p => p.id === idProduto);

    if (produto) {
        const itemExistente = carrinho.find(item => item.id === idProduto);
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        alert("Produto adicionado ao carrinho!");
    } else {
        alert("Produto não encontrado.");
    }
}

// Função para exibir produtos
function exibirProdutos() {
    const listaProdutos = document.getElementById("lista-produtos");
    listaProdutos.innerHTML = "";

    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(produtos => {
            produtos.forEach(produto => {
                const item = document.createElement("div");
                item.innerHTML = `
                    <h3>${produto.title}</h3>
                    <p>${produto.description}</p>
                    <p>Preço: R$ ${produto.price.toFixed(2)}</p>
                    <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
                `;
                listaProdutos.appendChild(item);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar produtos:", error);
            alert("Erro ao carregar produtos. Tente novamente.");
        });
}

// Chamar a função para exibir os produtos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    exibirProdutos();
});

// Função para finalizar a compra
function finalizarCompra() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const usuarioLogado = JSON.parse(localStorage.getItem(USUARIO_LOGADO_KEY));

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    if (!usuarioLogado) {
        alert("Você precisa estar logado para finalizar a compra.");
        return;
    }

    // Calcular o total da compra
    const total = carrinho.reduce((acc, item) => acc + item.price * item.quantidade, 0);

    // Criar o pedido
    const pedido = {
        id: Date.now(), // ID único para o pedido
        itens: carrinho,
        total: total,
        usuario: usuarioLogado.email
    };

    // Enviar notificação via AfterShip
    const mensagem = `Seu pedido #${pedido.id} foi confirmado. Total: R$ ${total.toFixed(2)}`;
    enviarNotificacaoAfterShip(usuarioLogado.email, mensagem);

    // Limpar o carrinho
    localStorage.removeItem("carrinho");

    // Feedback para o usuário
    alert("Compra finalizada com sucesso! Uma notificação foi enviada para o seu e-mail.");
    window.location.href = "catalogo.html"; // Redirecionar para o catálogo
}

// Função para exibir o carrinho
function exibirCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const listaCarrinho = document.getElementById("lista-carrinho");
    const totalCarrinho = document.getElementById("total-carrinho");

    listaCarrinho.innerHTML = ""; // Limpar a lista antes de exibir

    let total = 0;

    carrinho.forEach(item => {
        const itemCarrinho = document.createElement("div");
        itemCarrinho.innerHTML = `
            <p>${item.title} - R$ ${item.price.toFixed(2)} x ${item.quantidade}</p>
        `;
        listaCarrinho.appendChild(itemCarrinho);
        total += item.price * item.quantidade;
    });

    totalCarrinho.textContent = total.toFixed(2);
}

// Chamar a função para exibir o carrinho quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    exibirCarrinho();
});

// Função para abrir a página de edição do produto
function abrirFormularioEdicao(produtoId) {
    if (!produtoId) {
        alert("ID do produto não encontrado.");
        return;
    }

    const produtosLocais = JSON.parse(localStorage.getItem("produtosAdicionados")) || [];

    // Verificar se o produto existe no localStorage
    let produto = produtosLocais.find(p => p.id == produtoId);

    if (!produto) {
        // Se não encontrado no localStorage, buscar na API
        fetch(`https://fakestoreapi.com/products/${produtoId}`)
            .then(res => res.json())
            .then(produtoAPI => {
                if (!produtoAPI) {
                    throw new Error("Produto não encontrado na API");
                }
                produto = produtoAPI;
                mostrarFormularioEdicao(produto);
            })
            .catch(error => {
                console.error("Erro ao buscar o produto:", error);
                alert("Erro ao buscar o produto. Tente novamente mais tarde.");
            });
    } else {
        // Se encontrado no localStorage, abre o formulário de edição
        mostrarFormularioEdicao(produto);
    }
}


// Função para preencher o formulário de edição
function mostrarFormularioEdicao(produto) {
    const formularioEdicao = document.getElementById("formularioEdicao");
    formularioEdicao.innerHTML = `
        <h4>Editar Produto</h4>
        <form id="form-editar-produto">
            <label for="editarNome">Nome:</label>
            <input type="text" id="editarNome" class="form-control" value="${produto.title}" required>
            <label for="editarDescricao">Descrição:</label>
            <textarea id="editarDescricao" class="form-control" required>${produto.description}</textarea>
            <label for="editarPreco">Preço:</label>
            <input type="number" id="editarPreco" class="form-control" value="${produto.price}" required>
            <label for="editarStatus">Disponibilidade:</label>
            <select id="editarStatus" class="form-control" required>
                <option value="true" ${produto.availability ? "selected" : ""}>Disponível</option>
                <option value="false" ${!produto.availability ? "selected" : ""}>Indisponível</option>
            </select>
            <button type="submit" class="btn btn-success mt-3">Salvar Alterações</button>
            <button type="button" class="btn btn-secondary mt-3" id="cancelarEdicao">Cancelar</button>
        </form>
    `;

    // Impedir o recarregamento da página
    document.getElementById("form-editar-produto").addEventListener("submit", (event) => {
        event.preventDefault(); // Impede o envio do formulário
        salvarEdicao(produto.id); // Salva a edição
    });

    // Botão de cancelar
    document.getElementById("cancelarEdicao").addEventListener("click", () => {
        formularioEdicao.innerHTML = ""; // Limpa o formulário de edição
    });
}


// Função para salvar as alterações
function salvarEdicao(produtoId) {
    const tituloEditado = document.getElementById("editarNome").value;
    const descricaoEditada = document.getElementById("editarDescricao").value;
    const precoEditado = parseFloat(document.getElementById("editarPreco").value);
    const disponibilidadeEditada = document.getElementById("editarStatus").value === "true";

    const produtoAtualizado = {
        title: tituloEditado,
        description: descricaoEditada,
        price: precoEditado,
        availability: disponibilidadeEditada
    };

    // Atualizar no localStorage
    const produtosLocais = JSON.parse(localStorage.getItem("produtosAdicionados")) || [];
    const indexLocal = produtosLocais.findIndex(p => p.id == produtoId);
    if (indexLocal !== -1) {
        produtosLocais[indexLocal] = { ...produtosLocais[indexLocal], ...produtoAtualizado };
        localStorage.setItem("produtosAdicionados", JSON.stringify(produtosLocais));
    } else {
        // Atualizar na API
        fetch(`https://fakestoreapi.com/products/${produtoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produtoAtualizado)
        })
            .then(res => res.json())
            .then(data => {
                console.log("Produto atualizado na API:", data);
            })
            .catch(error => {
                console.error("Erro ao atualizar o produto na API:", error);
            });
    }

    alert("Produto atualizado com sucesso!");
    exibirProdutos(); // Recarregar lista de produtos
    document.getElementById("formularioEdicao").innerHTML = ""; // Limpar formulário
}

/* FUNÇÃO DA PÁGINA EDITAR PRODUTO */

// Função para pegar o ID da URL
function pegarIdProduto() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Exemplo de uso do ID para carregar os dados do produto
const produtoId = pegarIdProduto();
if (produtoId) {
    // Lógica para carregar as informações do produto com o ID
    console.log("ID do produto:", produtoId);
}





