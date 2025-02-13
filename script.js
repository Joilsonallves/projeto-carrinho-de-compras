//Função para mostrar o formulário de registro
function mostrarFormularioRegistro(){
    const formRegistro = document.getElementById("formRegistro");
    window.location.href = "registro.html";
}

// Função para registrar novo usuário
function registrarUsuario() {
    event.preventDefault(); // Evita o comportamento padrão do formulário

    // Capturando os valores do formulário
    const usuario = document.getElementById("usuario").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const cargo = document.getElementById("cargo").value;

    // Verifica se as senhas coincidem
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
    }

    // Cria o objeto do usuário para enviar à API
    const novoUsuario = {
        email: email,
        username: usuario,
        password: senha,
        cargo: cargo
    };

    // Enviar requisição para registrar o usuário na API
    fetch('https://fakestoreapi.com/users', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(novoUsuario)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Usuário registrado com sucesso:", data);
        alert(`Usuário registrado como ${cargo} com sucesso!`);

        // Recupera a lista de usuários do localStorage
        let usuarios = JSON.parse(localStorage.getItem('usuarios'));

        // Verifica se a lista de usuários não é um array
        if (!Array.isArray(usuarios)) {
            usuarios = []; // Caso não seja um array
        }

        // Adicionar o novo usuário à lista
        usuarios.push(novoUsuario);

        // Armazenar a lista de usuários no localStorage
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Redireciona o usuário para a tela de login
        window.location.href = "index.html"; // redireciona-se para o login

        document.getElementById("formRegistro").reset(); // Limpa o formulário após o registro
    })
    .catch(error => {
        console.error("Erro ao registrar o usuário:", error);
        alert("Erro ao registrar o usuário. Tente novamente mais tarde.");
    });
}


// Função para voltar ao formulário de login
function cancelarRegistro() {
    window.location.href = "index.html";
}

// Função para efetuar o login
function efetuarLogin() {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;

    // Verificar se os campos estão preenchidos
    if (!usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Verificar se o usuário existe no localStorage
    const usuarioRegistrado = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verifica se o usuário registrado existe na lista
    const usuarioEncontrado = usuarioRegistrado.find(user => user.username === usuario);

    if (!usuarioEncontrado) {
        alert("Nenhum usuário registrado encontrado.");
        return;
    }

    // Verifica se as credenciais estão corretas
    if (senha === usuarioEncontrado.password) {
        alert('Login efetuado com sucesso!');

        // Armazena usuário no localStorage com token
        localStorage.setItem("usuarioLogado", JSON.stringify({
            nome: usuario,
            cargo: usuarioEncontrado.cargo
        }));

        console.log("Usuário logado:", JSON.parse(localStorage.getItem("usuarioLogado")));

        // Redirecionar com base no tipo de usuário
        if (usuarioEncontrado.cargo === "administrador") {
            window.location.href = "painelAdmin.html"; // Redirecionamento para painel de admin
        } else {
            window.location.href = "catalogo.html"; // Redirecionamento para catálogo (clientes)
        }
    } else {
        alert('Usuário ou senha incorretos.');
    }
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

    // Criar o objeto do produto
    const produto = {
        title: nomeDoProduto,
        description: descricaoDoProduto,
        price: parseFloat(precoDoProduto),
        availability: statusDoProduto === "1" // Verifica se o status é "1" (Disponível)
    };

    // Fazer a requisição POST para a API
    fetch('https://fakestoreapi.com/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao adicionar o produto na API');
            }
            return response.json();
        })
        .then(data => {
            console.log("Produto adicionado:", data);
            alert("Produto adicionado com sucesso!");

            // Armazenar o produto localmente
            const produtosLocais = JSON.parse(localStorage.getItem("produtosAdicionados")) || [];
            produtosLocais.push({ ...data, availability: produto.availability }); // Inclui a disponibilidade
            localStorage.setItem("produtosAdicionados", JSON.stringify(produtosLocais));

            // Atualizar a lista de produtos
            exibirProdutos();

            // Limpar os campos do formulário
            document.getElementById("nomeDoProduto").value = '';
            document.getElementById("descricaoDoProduto").value = '';
            document.getElementById("precoDoProduto").value = '';
            document.getElementById("statusDoProduto").value = '';
        })
        .catch(error => {
            console.error("Erro ao adicionar o produto:", error);
            alert("Erro ao adicionar o produto. Por favor, tente novamente.");
        });
}

// Função para exibir a lista de produtos
function exibirProdutos() {
    const listaDeProdutosNovos = document.getElementById("listaDeProdutosNovos");
    listaDeProdutosNovos.innerHTML = ''; // Limpar lista antes de exibir os novos produtos

    const produtosLocais = JSON.parse(localStorage.getItem("produtosAdicionados")) || [];

    fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(produtosAPI => {
            const produtosCombinados = [...produtosAPI, ...produtosLocais];

            produtosCombinados.forEach(produto => {
                const item = document.createElement('div');
                item.classList.add('col-12', 'col-md-6', 'col-lg-3', 'mb-4');

                // Classe para disponibilidade
                const statusClasse = produto.availability ? "text-success" : "text-danger";

                // Estrutura do produto
                item.innerHTML = `
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${produto.title}</h5>
                            <p class="card-text"><strong>Descrição:</strong> ${produto.description}</p>
                            <p class="card-text"><strong>Preço:</strong> R$ ${produto.price.toFixed(2)}</p>
                            <p class="card-text">
                                <strong>Disponibilidade:</strong> <span class="${statusClasse}">${
                                    produto.availability ? "Disponível" : "Indisponível"
                                }</span>
                            </p>
                            <button class="btn btn-primary btn-sm editar-produto" data-id="${produto.id}">Editar</button>
                        </div>
                    </div>
                `;

                listaDeProdutosNovos.appendChild(item);
            });

            // Adicionando o evento ao botão de edição após o carregamento dos produtos
            const botoesEditar = document.querySelectorAll('.editar-produto');
            botoesEditar.forEach(botao => {
                botao.addEventListener('click', function() {
                    // Recuperando o ID do produto ao clicar no botão
                    const produtoId = this.getAttribute('data-id');
                    if (produtoId) {
                        // Se o ID for encontrado, abrir o formulário de edição
                        abrirFormularioEdicao(produtoId);
                    } else {
                        console.error("ID do produto não encontrado.");
                    }
                });
            });
        })
        .catch(error => {
            console.error("Erro ao carregar os produtos:", error);
            alert("Erro ao carregar os produtos. Tente novamente mais tarde.");
        });
}




// Chamar a função para exibir os produtos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    exibirProdutos();
});


// Função para abrir a página de edição do produto
function abrirFormularioEdicao() {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');

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
