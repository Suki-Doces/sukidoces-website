<?php
require_once __DIR__ . '/../../database/database.php';

if (!isset($_POST["id"])) {
    die("ID inválido.");
}

$id = $_POST["id"];

// ... (código existente de busca e validação de imagem permanece igual) ...
// ...

// Captura campos (incluindo o novo product_category)
$nome  = $_POST['product_name'] ?? '';
$cat   = !empty($_POST['product_category']) ? $_POST['product_category'] : null; // Novo
$preco = $_POST['product_price'] ?? 0;
$qtd   = $_POST['product_qtd'] ?? 0;
$data  = $_POST['product_date'] ?? date('Y-m-d');

// Lógica de imagem (Mantida do arquivo original - use o bloco existente lá)
// ... $novaImagem = ...

// Atualiza SQL para incluir id_categoria
$sql = $pdo->prepare("
    UPDATE produtos 
    SET nome=?, id_categoria=?, preco=?, quantidade=?, data_criacao=?, imagem=?
    WHERE id_produto=?
");

try {
    $sql->execute([$nome, $cat, $preco, $qtd, $data, $novaImagem ?? '', $id]);
    echo "OK";
} catch (Exception $e) {
    echo "Erro SQL: " . $e->getMessage();
}
?>