<?php
session_start();
require_once __DIR__ . '/../database/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: conta/login.php");
    exit;
}

$id_usuario = $_SESSION['user_id'];

// Busca pedidos
try {
    $sql = "SELECT * FROM pedidos WHERE id_usuario = :id_user ORDER BY data_pedido DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id_user' => $id_usuario]);
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $pedidos = [];
}

function getStatusClass($status) {
    $map = [
        'pendente' => 'status-pendente',
        'pago' => 'status-pago',
        'enviado' => 'status-enviado',
        'entregue' => 'status-entregue',
        'cancelado' => 'status-cancelado'
    ];
    return $map[$status] ?? '';
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Pedidos - Suki Doces</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="./css/meus_pedidos.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
</head>
<body>
    <?php require_once '../components/header/header.php'; ?>

    <main class="orders-container">
        <h1 class="page-title">Meus Pedidos</h1>
        <p class="page-subtitle">Acompanhe o status das suas compras</p>

        <?php if (!empty($_GET['sucesso'])): ?>
            <div class="msg-box success">
                <span class="material-symbols-rounded">check_circle</span>
                <?= htmlspecialchars($_GET['sucesso']) ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($_GET['erro'])): ?>
            <div class="msg-box error">
                <span class="material-symbols-rounded">error</span>
                <?= htmlspecialchars($_GET['erro']) ?>
            </div>
        <?php endif; ?>

        <?php if (empty($pedidos)): ?>
            <div class="empty-state">
                <img src="../assets/icons/interface/cart-icon.svg" alt="Sem pedidos">
                <p>Você ainda não fez nenhum pedido.</p>
                <a href="produtos.php" class="button-fill btn-shop">Ir às compras</a>
            </div>
        <?php else: ?>
            <div class="orders-list">
                <?php foreach ($pedidos as $pedido): 
                    $stmtItens = $pdo->prepare("SELECT ip.*, p.nome, p.imagem FROM itens_pedido ip JOIN produtos p ON ip.id_produto = p.id_produto WHERE ip.id_pedido = :id");
                    $stmtItens->execute([':id' => $pedido['id_pedido']]);
                    $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);
                ?>
                
                <article class="order-card">
                    <div class="order-header">
                        <div class="order-id">
                            <span class="label">Pedido</span>
                            <strong>#<?= str_pad($pedido['id_pedido'], 4, '0', STR_PAD_LEFT) ?></strong>
                        </div>
                        <div class="order-date">
                            <span class="material-symbols-rounded icon">calendar_today</span>
                            <?= date('d/m/Y', strtotime($pedido['data_pedido'])) ?>
                        </div>
                        <div class="order-status <?= getStatusClass($pedido['status']) ?>">
                            <?= ucfirst($pedido['status']) ?>
                        </div>
                    </div>

                    <div class="order-body">
                        <div class="order-items-preview">
                            <?php foreach ($itens as $item): ?>
                                <div class="item-row">
                                    <div class="item-img-box">
                                        <img src="<?= !empty($item['imagem']) ? '../assets/uploads/'.$item['imagem'] : '../assets/images/img-ic.svg' ?>" alt="Produto">
                                    </div>
                                    <div class="item-details">
                                        <p class="item-name"><?= htmlspecialchars($item['nome']) ?></p>
                                        <p class="item-qtd">Qtd: <?= $item['quantidade'] ?> x R$ <?= number_format($item['preco_unitario'], 2, ',', '.') ?></p>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="order-footer">
                        <div class="total-info">
                            <span>Total:</span>
                            <span class="price">R$ <?= number_format($pedido['valor_total'], 2, ',', '.') ?></span>
                        </div>
                        
                        <div class="actions">
                            <?php if ($pedido['status'] === 'enviado'): ?>
                                <button class="btn-track" onclick="alert('Código: BR123456789')">Rastrear</button>
                            <?php endif; ?>

                            <?php if ($pedido['status'] === 'pendente'): ?>
                                <form action="pedido_actions.php" method="POST" onsubmit="return confirm('Tem certeza que deseja cancelar este pedido? A ação não pode ser desfeita.');">
                                    <input type="hidden" name="acao" value="cancelar">
                                    <input type="hidden" name="id_pedido" value="<?= $pedido['id_pedido'] ?>">
                                    <button type="submit" class="btn-cancel">Cancelar Pedido</button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>

    <?php 
    require_once '../components/footer/footer.php'; 
    require_once '../components/hover-nav/hover-nav.php';
    require_once '../components/vlibras-comp.php';
    ?>
</body>
</html>