<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once BASE_DIR . '/database/database.php'; 

if (isset($_POST["add_product"])) {

    // CSRF Check
    if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '')) {
        header('Location: ' . BASE_URL . '/pages/product/produtos.php?erro=csrf');
        exit;
    }

    $nome  = trim($_POST["product_name"] ?? '');
    $preco = $_POST["product_price"] ?? '';
    $qtd   = $_POST["product_qtd"] ?? '';
    // Novo campo
    $categoria = $_POST["product_category"] ?? null; 

    // Validações básicas
    if ($nome === '') {
        header('Location: ' . BASE_URL . '/pages/product/produtos.php?erro=' . urlencode('Nome inválido'));
        exit;
    }
    // Validar categoria
    if (empty($categoria)) {
        header('Location: ' . BASE_URL . '/pages/product/produtos.php?erro=' . urlencode('Selecione uma categoria'));
        exit;
    }

    // (O restante do código de upload de imagem permanece igual ao original, omitido aqui para brevidade, mas deve ser mantido)
    // ... [CÓDIGO DE UPLOAD DE IMAGEM AQUI] ...
    
    // Simulação do upload bem sucedido para montar a query (no seu arquivo real, mantenha o bloco de upload)
    $pasta = BASE_DIR . '/assets/uploads/';
    // ... lógica de upload ...
    // Supondo que $nomeImagem foi gerado com sucesso:
    if(!isset($nomeImagem)) {
         // Lógica rápida de upload apenas para exemplo, use a original do arquivo
         $arquivo = $_FILES["product_image"];
         $ext = pathinfo($arquivo["name"], PATHINFO_EXTENSION);
         $nomeImagem = time() . "-" . uniqid() . "." . $ext;
         move_uploaded_file($arquivo["tmp_name"], $pasta . $nomeImagem);
    }

    /* 3. SALVAR NO BANCO COM CATEGORIA */
    // Trigger trg_produto_insert já preenche o estoque
    $sql = $pdo->prepare("
        INSERT INTO produtos (nome, id_categoria, preco, quantidade, data_criacao, imagem)
        VALUES (?, ?, ?, ?, NOW(), ?)
    ");

    $executou = $sql->execute([$nome, $categoria, $preco, $qtd, $nomeImagem]);

    if ($executou) {
        header('Location: ' . BASE_URL . '/pages/product/produtos.php?sucesso=1');
        exit;
    } else {
        header('Location: ' . BASE_URL . '/pages/product/produtos.php?erro=' . urlencode('Erro ao cadastrar produto'));
        exit;
    }
}
?>