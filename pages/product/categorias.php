<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';
include_once __DIR__ . '/../../include/vlibras.php';

// Auth Check
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../conta/login.php");
    exit;
}

// Buscar Categorias
$stmt = $pdo->query("SELECT * FROM categorias ORDER BY id_categoria DESC");
$categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/add-produto.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/storage.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/mini-table.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">
    <title>Gerenciar Categorias</title>
    <style>
        /* Ajustes específicos para esta página */
        .admin-product-form-container form { max-width: 600px; }
        .edit-mode { border: 2px solid #27ae60 !important; }
    </style>
</head>
<body>
    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>
    
    <main class="main-content">
        <div id="content-dashboard" class="content active">
            <h1>Categorias</h1>
            <p class="page-subtitle">Organize os departamentos da sua loja.</p>
        </div>

        <br>

        <div class="container">
            
            <div class="admin-product-form-container">
                <form id="categoryForm" action="processa_categoria.php" method="POST">
                    <h3 id="formTitle">Nova Categoria</h3>
                    
                    <input type="hidden" name="acao" id="acao" value="adicionar">
                    <input type="hidden" name="id_categoria" id="id_categoria">

                    <input type="text" placeholder="Nome da Categoria" name="nome" id="nome" class="box" required>
                    <input type="text" placeholder="Descrição (Opcional)" name="descricao" id="descricao" class="box">

                    <div style="display:flex; gap:10px;">
                        <input type="submit" class="btn" id="btnSubmit" value="Salvar Categoria">
                        <button type="button" id="btnCancel" class="btn" style="background:#e74c3c; display:none;" onclick="resetForm()">Cancelar</button>
                    </div>
                </form>
            </div>

            <br><br>

            <div class="table_container">
                <h3>Categorias Existentes</h3>
                <a href="produtos.php" style="margin-bottom:15px; display:inline-block;">← Voltar para Produtos</a>

                <table class="content-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach($categorias as $cat): ?>
                        <tr>
                            <td>#<?= $cat['id_categoria'] ?></td>
                            <td><strong style="color:var(--black);"><?= htmlspecialchars($cat['nome']) ?></strong></td>
                            <td><?= htmlspecialchars($cat['descricao']) ?></td>
                            <td>
                                <button type="button" class="btn-edit" onclick='editCategory(<?= json_encode($cat) ?>)'>
                                    <img src="<?= BASE_URL ?>/assets/icon/Editar-Icon.svg" alt="Editar">
                                </button>
                                <button type="button" class="btn-trash" onclick="deleteCategory(<?= $cat['id_categoria'] ?>)">
                                    <img src="<?= BASE_URL ?>/assets/icon/Trash - Icon.svg" alt="Deletar">
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

        </div>
    </main>

    <script>
        function editCategory(cat) {
            document.getElementById('formTitle').innerText = 'Editar Categoria #' + cat.id_categoria;
            document.getElementById('acao').value = 'editar';
            document.getElementById('id_categoria').value = cat.id_categoria;
            document.getElementById('nome').value = cat.nome;
            document.getElementById('descricao').value = cat.descricao;
            document.getElementById('btnSubmit').value = 'Atualizar';
            document.getElementById('btnCancel').style.display = 'block';
            
            // Scroll to form
            document.querySelector('.admin-product-form-container').scrollIntoView({behavior: 'smooth'});
            document.getElementById('nome').focus();
        }

        function resetForm() {
            document.getElementById('categoryForm').reset();
            document.getElementById('formTitle').innerText = 'Nova Categoria';
            document.getElementById('acao').value = 'adicionar';
            document.getElementById('id_categoria').value = '';
            document.getElementById('btnSubmit').value = 'Salvar Categoria';
            document.getElementById('btnCancel').style.display = 'none';
        }

        function deleteCategory(id) {
            if(confirm('Tem certeza? Isso pode afetar produtos vinculados a esta categoria.')) {
                // Cria um form dinâmico para enviar o post de delete
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'processa_categoria.php';
                
                const inputAcao = document.createElement('input');
                inputAcao.type = 'hidden';
                inputAcao.name = 'acao';
                inputAcao.value = 'deletar';
                
                const inputId = document.createElement('input');
                inputId.type = 'hidden';
                inputId.name = 'id_categoria';
                inputId.value = id;

                form.appendChild(inputAcao);
                form.appendChild(inputId);
                document.body.appendChild(form);
                form.submit();
            }
        }
    </script>
    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
</body>
</html>