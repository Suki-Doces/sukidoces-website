<?php
session_start();
require_once __DIR__ . '/../../database/database.php';

// 1. Validações Básicas
if (!isset($_SESSION['user_id']) || empty($_SESSION['carrinho']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../listingPage/listingPage.php");
    exit;
}

$id_usuario = $_SESSION['user_id'];
$metodo_pagamento = $_POST['metodo_pagamento'];

// 2. Recalcula o valor total para evitar fraudes via HTML
$ids = implode(',', array_keys($_SESSION['carrinho']));
// Seleciona os produtos do banco
$sql = "SELECT p.id_produto, p.preco, p.nome FROM produtos p WHERE p.id_produto IN ($ids)";
$stmt = $pdo->query($sql);
$produtos_db = $stmt->fetchAll(PDO::FETCH_ASSOC);

$valor_total = 0;
$frete = 10.00;
$itens_para_inserir = [];

// Preparando dados e validando estoque
foreach ($produtos_db as $prod) {
    $id = $prod['id_produto'];
    $qtd_compra = $_SESSION['carrinho'][$id];
    
    // Verifica estoque
    $stmtEstoque = $pdo->prepare("SELECT quantidade_atual FROM estoque WHERE id_produto = ?");
    $stmtEstoque->execute([$id]);
    $estoque = $stmtEstoque->fetchColumn();

    if ($estoque < $qtd_compra) {
        // Em caso de erro de estoque, cancela e avisa (aqui simplificado com die)
        die("Estoque insuficiente para o produto: " . $prod['nome']);
    }

    $valor_total += ($prod['preco'] * $qtd_compra);
    
    $itens_para_inserir[] = [
        'id_produto' => $id,
        'quantidade' => $qtd_compra,
        'preco_unitario' => $prod['preco']
    ];
}

$valor_total += $frete;
// Define status inicial com base no pagamento
$status_pedido = ($metodo_pagamento === 'pix' || $metodo_pagamento === 'cartao') ? 'pago' : 'pendente';

try {
    // INÍCIO DA TRANSAÇÃO
    $pdo->beginTransaction();

    // 3. Inserir na tabela PEDIDOS
    $sqlPedido = "INSERT INTO pedidos (id_usuario, valor_total, metodo_pagamento, status, data_pedido) 
                  VALUES (:id_usuario, :valor, :metodo, :status, NOW())";
    $stmt = $pdo->prepare($sqlPedido);
    $stmt->execute([
        ':id_usuario' => $id_usuario,
        ':valor' => $valor_total,
        ':metodo' => $metodo_pagamento,
        ':status' => $status_pedido
    ]);
    
    $id_pedido = $pdo->lastInsertId();

    // 4. Inserir ITENS_PEDIDO e Atualizar ESTOQUE
    $sqlItem = "INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) 
                VALUES (:id_pedido, :id_prod, :qtd, :preco)";
    $stmtItem = $pdo->prepare($sqlItem);

    $sqlEstoque = "UPDATE estoque SET quantidade_atual = quantidade_atual - :qtd 
                   WHERE id_produto = :id_prod";
    $stmtEstoque = $pdo->prepare($sqlEstoque);

    foreach ($itens_para_inserir as $item) {
        // Insere item
        $stmtItem->execute([
            ':id_pedido' => $id_pedido,
            ':id_prod' => $item['id_produto'],
            ':qtd' => $item['quantidade'],
            ':preco' => $item['preco_unitario']
        ]);

        // Baixa estoque
        $stmtEstoque->execute([
            ':qtd' => $item['quantidade'],
            ':id_prod' => $item['id_produto']
        ]);
    }

    // CONFIRMA A TRANSAÇÃO
    $pdo->commit();

    // 5. Limpa o carrinho
    unset($_SESSION['carrinho']);

    // 6. Redireciona para sucesso
    header("Location: check_success.php?pedido=" . $id_pedido);
    exit;

} catch (Exception $e) {
    // Se der erro, desfaz tudo
    $pdo->rollBack();
    die("Erro ao processar pedido: " . $e->getMessage());
}
?>