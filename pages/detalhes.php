<?php
require_once __DIR__ . '/../database/database.php';

// 1. Verifica se existe um ID na URL
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header("Location: produtos.php"); // Se não tiver ID, volta para o catálogo
    exit;
}

$id_produto = (int)$_GET['id'];

// 2. Busca apenas o produto específico no banco
try {
    $stmt = $pdo->prepare("SELECT * FROM produtos WHERE id_produto = :id");
    $stmt->bindParam(':id', $id_produto);
    $stmt->execute();
    $produto = $stmt->fetch(PDO::FETCH_ASSOC);

    // Se o produto não existir (ex: id=9999), volta para o catálogo
    if (!$produto) {
        header("Location: produtos.php");
        exit;
    }
} catch (PDOException $e) {
    die("Erro ao buscar produto.");
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($produto['nome']) ?> - Suki Doces</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="./css/detalhes.css">
</head>
<body>
    <?php require_once '../components/header/header.php'; ?>

    <main class="detail-container">
        <a href="produtos.php" class="back-link">← Voltar para o cardápio</a>

        <div class="product-detail-wrapper">
            <div class="detail-image">
                 <img src="<?= !empty($produto['imagem']) ? '../assets/uploads/' . $produto['imagem'] : '../assets/images/img-ic.svg' ?>" 
                      alt="<?= htmlspecialchars($produto['nome']) ?>">
            </div>

            <div class="detail-info">
                <h1><?= htmlspecialchars($produto['nome']) ?></h1>
                
                <div class="detail-price">
                    R$ <?= number_format($produto['preco'], 2, ',', '.') ?>
                </div>

                <div class="detail-description">
                    <h3>Sobre este doce:</h3>
                    <p><?= nl2br(htmlspecialchars($produto['descricao'])) ?></p>
                </div>

                <form action="carrinho_actions.php" method="POST" class="purchase-actions">
                    <input type="hidden" name="acao" value="adicionar">
                    <input type="hidden" name="id_produto" value="<?= $produto['id_produto'] ?>">

                    <div class="qty-selector">
                        <button type="button" onclick="decrement()">-</button>
                        <input type="number" id="qty" name="qtd" value="1" min="1" readonly>
                        <button type="button" onclick="increment()">+</button>
                    </div>

                    <button type="submit" class="btn-add-cart">Adicionar ao Carrinho</button>
                </form>

                <div class="stock-info">
                    <?php if($produto['quantidade'] > 0): ?>
                        <span class="in-stock">Disponível em estoque (<?= $produto['quantidade'] ?> un.)</span>
                    <?php else: ?>
                        <span class="out-stock">Indisponível no momento</span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>

    <script>
        function increment() {
            var value = parseInt(document.getElementById('qty').value, 10);
            value = isNaN(value) ? 0 : value;
            if(value < <?= $produto['quantidade'] ?>) {
                value++;
                document.getElementById('qty').value = value;
            }
        }
        function decrement() {
            var value = parseInt(document.getElementById('qty').value, 10);
            value = isNaN(value) ? 0 : value;
            if(value > 1) {
                value--;
                document.getElementById('qty').value = value;
            }
        }
    </script>

    <?php
    require_once '../components/footer/footer.php';
    require_once '../components/hover-nav/hover-nav.php';
    require_once '../components/vlibras-comp.php';
    ?>
</body>
</html>