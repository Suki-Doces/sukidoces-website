<?php
session_start();
require_once __DIR__ . "/../../include/config.php";
require_once __DIR__ . "/../../database/database.php";

// Verifica login
if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    header("Location: ../conta/login.php");
    exit;
}

// Verifica se veio ID
if (!isset($_GET["id"])) {
    echo "ID do produto não informado.";
    exit;
}

$id = intval($_GET["id"]);

// Busca produto
$stmt = $pdo->prepare("SELECT * FROM produtos WHERE id_produto = ?");
$stmt->execute([$id]);
$produto = $stmt->fetch(PDO::FETCH_ASSOC);

// Busca categorias para preencher o select
$stmtCat = $pdo->query("SELECT * FROM categorias ORDER BY nome ASC");
$categorias = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

if (!$produto) {
    echo "Produto não encontrado.";
    exit;
}
?>

<form action="<?= BASE_URL ?>/pages/storage/atualiza_produto.php" method="POST" enctype="multipart/form-data" class="modal-form">

    <input type="hidden" name="id" value="<?= $produto['id_produto'] ?>">

    <label>Nome:</label>
    <input type="text" name="product_name" value="<?= htmlspecialchars($produto['nome']) ?>" required>

    <label>Categoria:</label>
    <select name="product_category" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; background: #fafafa;">
        <option value="">Sem categoria</option>
        <?php foreach($categorias as $cat): ?>
            <option value="<?= $cat['id_categoria'] ?>" <?= ($produto['id_categoria'] == $cat['id_categoria']) ? 'selected' : '' ?>>
                <?= htmlspecialchars($cat['nome']) ?>
            </option>
        <?php endforeach; ?>
    </select>

    <label>Quantidade:</label>
    <input type="number" name="product_qtd" value="<?= $produto['quantidade'] ?>" required>

    <label>Preço:</label>
    <input type="text" name="product_price" value="<?= $produto['preco'] ?>" required>

    <label>Data Criação:</label>
    <input type="date" name="product_date" value="<?= date('Y-m-d', strtotime($produto['data_criacao'])) ?>">

    <p>Imagem atual:</p>
    <img src="<?= BASE_URL ?>/assets/uploads/<?= $produto['imagem'] ?>" width="80" style="border-radius:6px; margin-bottom:10px;">

    <label>Alterar imagem (opcional):</label>
    <input type="file" accept="image/*" name="product_image">

    <button type="submit" class="modal-btn">Salvar alterações</button>

</form>