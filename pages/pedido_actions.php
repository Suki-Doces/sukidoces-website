<?php
session_start();
require_once __DIR__ . '/../database/database.php';

// Verifica login
if (!isset($_SESSION['user_id'])) {
    header("Location: conta/login.php");
    exit;
}

$acao = $_POST['acao'] ?? '';

if ($acao === 'cancelar') {
    $id_pedido = filter_input(INPUT_POST, 'id_pedido', FILTER_VALIDATE_INT);
    $id_usuario = $_SESSION['user_id'];

    if (!$id_pedido) {
        header("Location: meus_pedidos.php?erro=" . urlencode("ID do pedido inválido."));
        exit;
    }

    try {
        // Inicia Transação
        $pdo->beginTransaction();

        // 1. Verifica se o pedido pertence ao usuário e se pode ser cancelado (apenas 'pendente')
        // Você pode adicionar 'pago' na lista se sua regra de negócio permitir estorno automático ou manual depois
        $stmt = $pdo->prepare("SELECT status FROM pedidos WHERE id_pedido = ? AND id_usuario = ?");
        $stmt->execute([$id_pedido, $id_usuario]);
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pedido) {
            throw new Exception("Pedido não encontrado.");
        }

        if ($pedido['status'] !== 'pendente') {
            throw new Exception("Apenas pedidos com status 'Pendente' podem ser cancelados pelo site. Para outros casos, entre em contato.");
        }

        // 2. Atualiza o status do pedido para 'cancelado'
        $stmtUpdate = $pdo->prepare("UPDATE pedidos SET status = 'cancelado' WHERE id_pedido = ?");
        $stmtUpdate->execute([$id_pedido]);

        // 3. Busca os itens do pedido para devolver ao estoque
        $stmtItens = $pdo->prepare("SELECT id_produto, quantidade FROM itens_pedido WHERE id_pedido = ?");
        $stmtItens->execute([$id_pedido]);
        $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);

        // 4. Devolve as quantidades ao estoque
        $stmtEstoque = $pdo->prepare("UPDATE estoque SET quantidade_atual = quantidade_atual + ? WHERE id_produto = ?");
        
        foreach ($itens as $item) {
            $stmtEstoque->execute([$item['quantidade'], $item['id_produto']]);
        }

        // Confirma as alterações
        $pdo->commit();
        header("Location: meus_pedidos.php?sucesso=" . urlencode("Pedido #$id_pedido cancelado com sucesso."));
        exit;

    } catch (Exception $e) {
        // Em caso de erro, desfaz tudo
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        header("Location: meus_pedidos.php?erro=" . urlencode($e->getMessage()));
        exit;
    }
}

// Se não for nenhuma ação conhecida, volta
header("Location: meus_pedidos.php");
exit;
?>