<?php
session_start();
require_once __DIR__ . '/../database/database.php';

// Inicializa carrinho vazio se necessário
if (!isset($_SESSION['carrinho'])) {
    $_SESSION['carrinho'] = [];
}

$carrinho_itens = [];
$total_carrinho = 0;

if (!empty($_SESSION['carrinho'])) {
    // Sanitiza os IDs para a query (embora array_keys de ints seja seguro, é boa prática)
    $ids = implode(',', array_map('intval', array_keys($_SESSION['carrinho'])));
    
    if (!empty($ids)) {
        $sql = "SELECT * FROM produtos WHERE id_produto IN ($ids)";
        $stmt = $pdo->query($sql);
        $produtos_db = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($produtos_db as $prod) {
            $id = $prod['id_produto'];
            $qtd = $_SESSION['carrinho'][$id];
            $subtotal = $prod['preco'] * $qtd;
            $total_carrinho += $subtotal;
            
            // Adiciona dados calculados ao array do produto
            $prod['qtd_carrinho'] = $qtd;
            $prod['subtotal'] = $subtotal;
            $carrinho_itens[] = $prod;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Carrinho - Suki Doces</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="./css/carrinho.css">
</head>
<body>
    <?php 
    // Componente Header
    require_once '../components/header/header.php'; 
    ?>

    <main class="cart-container">
        <h1>Seu Carrinho</h1>

        <?php if (empty($carrinho_itens)): ?>
            <div class="empty-cart">
                <p>Seu carrinho está vazio.</p>
                <a href="produtos.php" class="btn-continuar">Voltar às compras</a>
            </div>
        <?php else: ?>
            
            <div class="cart-layout">
                <div class="cart-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Preço</th>
                                <th>Qtd</th>
                                <th>Total</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($carrinho_itens as $item): ?>
                            <tr>
                                <td class="product-col">
                                    <img src="<?= !empty($item['imagem']) ? '../assets/uploads/' . $item['imagem'] : '../assets/images/img-ic.svg' ?>" alt="Foto do Produto">
                                    <span><?= htmlspecialchars($item['nome']) ?></span>
                                </td>
                                <td>R$ <?= number_format($item['preco'], 2, ',', '.') ?></td>
                                <td>
                                    <form action="carrinho_actions.php" method="POST" class="qty-form">
                                        <input type="hidden" name="acao" value="atualizar">
                                        <input type="hidden" name="id_produto" value="<?= $item['id_produto'] ?>">
                                        <input type="number" name="qtd" value="<?= $item['qtd_carrinho'] ?>" min="1" onchange="this.form.submit()">
                                    </form>
                                </td>
                                <td>R$ <?= number_format($item['subtotal'], 2, ',', '.') ?></td>
                                <td>
                                    <a href="carrinho_actions.php?acao=remover&id=<?= $item['id_produto'] ?>" class="btn-remove">Remover</a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <aside class="cart-summary">
                    <h2>Resumo do Pedido</h2>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>R$ <?= number_format($total_carrinho, 2, ',', '.') ?></span>
                    </div>
                    <div class="summary-row">
                        <span>Frete (Fixo)</span>
                        <span>R$ 10,00</span>
                    </div>
                    <hr>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>R$ <?= number_format($total_carrinho + 10, 2, ',', '.') ?></span>
                    </div>

                    <a href="checkoutPage/checkout.php" class="btn-checkout">Finalizar Compra</a>
                    <a href="produtos.php" class="btn-continue">Continuar Comprando</a>
                </aside>
            </div>
        <?php endif; ?>
    </main>

    <?php
    // Componentes de Rodapé, Navegação Flutuante e Acessibilidade
    require_once '../components/footer/footer.php';
    require_once '../components/hover-nav/hover-nav.php';
    require_once '../components/vlibras-comp.php';
    ?>
</body>
</html>