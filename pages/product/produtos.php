<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';
include_once __DIR__ . '/../../include/vlibras.php';

// Verifica se o usuário está logado e é admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../conta/login.php");
    exit;
}

// 1. Busca Categorias para o Select
try {
    $stmtCat = $pdo->query("SELECT * FROM categorias ORDER BY nome ASC");
    $categorias = $stmtCat->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $categorias = [];
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/add-produto.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/pop-up.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">
    <title>Adicionar Produto</title>
</head>
<body>
    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>
    <main class="main-content">
    <div id="content-dashboard" class="content active">
        <h1 style="font-size: 32px;">Produtos</h1>
        <p style="font-size: 15px;" class="page-subtitle">Gerencie sua Mercadoria aqui.</p>
    </div>

    <br><br>

    <div class="container">
        
        <div style="margin-bottom: 20px; text-align: right;">
            <a href="categorias.php" class="btn" style="background: var(--black); width: auto; display: inline-block; padding: 10px 20px;">
                Gerenciar Categorias
            </a>
        </div>

        <div class="admin-product-form-container">

            <?php
            if (empty($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }
            ?>
            <form id="addProductForm" action="<?= BASE_URL ?>/pages/product/processa_produto.php" method="POST" enctype="multipart/form-data">
                <h3>Adicionar Produto</h3>

                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">

                <input type="text" placeholder="Digite o nome do produto" name="product_name" class="box" required>

                <select name="product_category" class="box" required>
                    <option value="" disabled selected>Selecione uma Categoria</option>
                    <?php if (!empty($categorias)): ?>
                        <?php foreach($categorias as $cat): ?>
                            <option value="<?= $cat['id_categoria'] ?>"><?= htmlspecialchars($cat['nome']) ?></option>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <option value="" disabled>Nenhuma categoria cadastrada</option>
                    <?php endif; ?>
                </select>

                <input type="number" step="0.01" placeholder="Insira o valor do produto" name="product_price" class="box" required>

                <input type="number" placeholder="Coloque a quantidade" name="product_qtd" class="box" required>

                <input type="file" accept="image/*,.webp,.jfif,.heic,.heif,.ico" name="product_image" class="box" required>

                <input type="submit" class="btn" name="add_product" value="Adicionar Produto">
            </form>

        </div>
    </div>
    
    <?php if (!empty($_GET['erro'])): ?>
        <div class="error-box" style="background:#ffe6e6;color:#9b1c1c;padding:12px;border-radius:8px;margin:16px;">
            <?= htmlspecialchars(urldecode($_GET['erro'])) ?>
        </div>
    <?php endif; ?>
    
    <?php if (!empty($_GET['sucesso'])): ?>
        <div id="popup-sucesso" class="popup" style="display:flex;">
            <div class="popup-content">
                <h2>Produto adicionado!</h2>
                <p>O produto foi registrado com sucesso.</p>
                <button onclick="window.location.href='produtos.php'">OK</button>
            </div>
        </div>
    <?php endif; ?>

    </main>

    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
</body>
</html>