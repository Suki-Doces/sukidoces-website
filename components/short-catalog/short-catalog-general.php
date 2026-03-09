<?php
// Inclui conexão com banco se ainda não foi incluída
require_once __DIR__ . '/../../database/database.php';

// 1. CONSULTA: MAIS VENDIDOS (Alto número de vendas)
// Faz um JOIN com a tabela itens_pedido para somar a quantidade vendida de cada produto
try {
    $sqlMaisVendidos = "
        SELECT p.*, COALESCE(SUM(ip.quantidade), 0) as total_vendas
        FROM produtos p
        LEFT JOIN itens_pedido ip ON p.id_produto = ip.id_produto
        GROUP BY p.id_produto
        ORDER BY total_vendas DESC
        LIMIT 10
    ";
    $stmt = $pdo->prepare($sqlMaisVendidos);
    $stmt->execute();
    $produtosMaisVendidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $produtosMaisVendidos = [];
}

// 2. CONSULTA: NOVOS (Adicionados recentemente)
// Ordena pelo ID de forma decrescente para pegar os últimos cadastrados
try {
    $sqlNovos = "SELECT * FROM produtos ORDER BY id_produto DESC LIMIT 10";
    $stmt = $pdo->prepare($sqlNovos);
    $stmt->execute();
    $produtosNovos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $produtosNovos = [];
}
?>

<head>
    <link rel="stylesheet" href="./components/short-catalog/short-catalog.css">
    <style>
        /* Estilos para o Switch de Categorias */
        .tab-content {
            display: none; /* Esconde as listas por padrão */
        }
        
        /* A lista ativa retoma o display grid original do .sc-scroll */
        .tab-content.active {
            display: grid; 
            animation: fadeIn 0.5s ease;
        }

        /* Animação suave na troca */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <section class="short-catalog-section">
        <h1>Recomendação de compra</h1>
        
        <div class="sc-nav">
            <button class="button-fill tab-btn" onclick="openCatalogTab(event, 'tab-mais-vendidos')">
                <p>Mais Vendidos</p>
            </button>
            <button class="button-contoured tab-btn" onclick="openCatalogTab(event, 'tab-novos')">
                <p>Novos</p>
            </button>
        </div>

        <div class="sc-items">
            
            <div id="tab-mais-vendidos" class="sc-scroll tab-content active">
                <?php if (!empty($produtosMaisVendidos)): ?>
                    <?php foreach ($produtosMaisVendidos as $prod): ?>
                    <a class="product-card" href="./pages/detalhes.php?id=<?= $prod['id_produto'] ?>">
                        <div class="ci-square-label">
                            <img src="<?= !empty($prod['imagem']) ? './assets/uploads/' . $prod['imagem'] : './assets/images/img-ic.svg' ?>" 
                                 alt="<?= htmlspecialchars($prod['nome']) ?>">
                        </div>
                        <div class="ci-product-info">
                            <h3 class="card-i-h3"><?= htmlspecialchars($prod['nome']) ?></h3>
                            <h2 class="price">R$ <?= number_format($prod['preco'], 2, ',', '.') ?></h2>
                            <span class="button-fill btn-see-more">Detalhes</span>
                        </div>
                    </a>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p style="padding: 20px;">Nenhum produto encontrado.</p>
                <?php endif; ?>
            </div>

            <div id="tab-novos" class="sc-scroll tab-content">
                <?php if (!empty($produtosNovos)): ?>
                    <?php foreach ($produtosNovos as $prod): ?>
                    <a class="product-card" href="./pages/detalhes.php?id=<?= $prod['id_produto'] ?>">
                        <div class="ci-square-label">
                            <img src="<?= !empty($prod['imagem']) ? './assets/uploads/' . $prod['imagem'] : './assets/images/img-ic.svg' ?>" 
                                 alt="<?= htmlspecialchars($prod['nome']) ?>">
                        </div>
                        <div class="ci-product-info">
                            <h3 class="card-i-h3"><?= htmlspecialchars($prod['nome']) ?></h3>
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                                <h2 class="price">R$ <?= number_format($prod['preco'], 2, ',', '.') ?></h2>
                                <span style="font-size: 0.7rem; background-color: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px;">NOVO</span>
                            </div>
                            <span class="button-fill btn-see-more">Detalhes</span>
                        </div>
                    </a>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p style="padding: 20px;">Nenhum produto novo encontrado.</p>
                <?php endif; ?>
            </div>

        </div>
    </section>

    <script>
    function openCatalogTab(evt, tabName) {
        // 1. Esconde todos os conteúdos
        var i, tabContent, tabBtns;
        tabContent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabContent.length; i++) {
            tabContent[i].classList.remove("active");
        }

        // 2. Reseta o estilo de todos os botões para "contoured" (borda apenas)
        tabBtns = document.getElementsByClassName("tab-btn");
        for (i = 0; i < tabBtns.length; i++) {
            tabBtns[i].classList.remove("button-fill");
            tabBtns[i].classList.add("button-contoured");
        }

        // 3. Mostra o conteúdo atual e define o botão clicado como "fill" (preenchido)
        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.classList.remove("button-contoured");
        evt.currentTarget.classList.add("button-fill");
    }
    </script>
</body>