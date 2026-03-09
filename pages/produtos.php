<?php
// pages/produtos.php
require_once __DIR__ . '/../database/database.php';

// --- 1. Inicialização de Variáveis de Filtro ---
$busca = filter_input(INPUT_GET, 'query', FILTER_SANITIZE_SPECIAL_CHARS);
$categoria_id = filter_input(INPUT_GET, 'categoria', FILTER_VALIDATE_INT);
$filtro_tipo = filter_input(INPUT_GET, 'filtro', FILTER_SANITIZE_SPECIAL_CHARS); // 'mais-vendidos', 'novos'

// --- 2. Buscar Categorias para o Menu ---
try {
    $stmtCat = $pdo->query("SELECT * FROM categorias ORDER BY nome ASC");
    $categorias = $stmtCat->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $categorias = [];
}

// --- 3. Construção da Query de Produtos ---
$sql = "SELECT p.*, c.nome as nome_categoria ";

// Se for mais vendidos, precisamos somar as vendas
if ($filtro_tipo === 'mais-vendidos') {
    $sql .= ", COALESCE(SUM(ip.quantidade), 0) as total_vendas ";
}

$sql .= "FROM produtos p 
         LEFT JOIN categorias c ON p.id_categoria = c.id_categoria ";

// Join para contagem de vendas se necessário
if ($filtro_tipo === 'mais-vendidos') {
    $sql .= "LEFT JOIN itens_pedido ip ON p.id_produto = ip.id_produto ";
}

// --- 4. Aplicação de Condições (WHERE) ---
$conditions = [];
$params = [];

// Filtro de Busca (Nome ou Descrição)
if ($busca) {
    $conditions[] = "(p.nome LIKE :busca OR p.descricao LIKE :busca)";
    $params[':busca'] = "%$busca%";
}

// Filtro por Categoria Específica
if ($categoria_id) {
    $conditions[] = "p.id_categoria = :cat_id";
    $params[':cat_id'] = $categoria_id;
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

// Agrupamento necessário para funções de agregação (SUM) ou segurança
$sql .= " GROUP BY p.id_produto ";

// --- 5. Ordenação (ORDER BY) ---
if ($filtro_tipo === 'mais-vendidos') {
    $sql .= " ORDER BY total_vendas DESC";
} elseif ($filtro_tipo === 'novos') {
    // Ordena por data de criação (ou ID se data não existir/for nula)
    $sql .= " ORDER BY p.data_criacao DESC, p.id_produto DESC";
} else {
    // Padrão: Ordem alfabética
    $sql .= " ORDER BY p.nome ASC";
}

// --- 6. Execução da Query ---
try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $produtos = [];
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nossos Produtos - Suki Doces</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="./css/produtos.css">
</head>
<body>
    <?php
    // HEADER //
    require_once '../components/header/header.php';
    ?>

    <main class="catalog-container">
        
        <?php if ($busca): ?>
            <h1 class="catalog-title">Resultados para: "<?= htmlspecialchars($busca) ?>"</h1>
            <a href="produtos.php" class="clear-search-link">Limpar pesquisa</a>
        <?php else: ?>
            <h1 class="catalog-title">Produtos</h1>
        <?php endif; ?>

        <div class="filters-bar">
            <a href="produtos.php" class="<?= (!$filtro_tipo && !$categoria_id && !$busca) ? 'button-fill' : 'button-contoured' ?>">
                Todos
            </a>

            <a href="produtos.php?filtro=mais-vendidos" class="<?= ($filtro_tipo === 'mais-vendidos') ? 'button-fill' : 'button-contoured' ?>">
                Mais Vendidos
            </a>

            <a href="produtos.php?filtro=novos" class="<?= ($filtro_tipo === 'novos') ? 'button-fill' : 'button-contoured' ?>">
                Novos
            </a>

            <div class="filter-separator">|</div>

            <?php foreach ($categorias as $cat): ?>
                <a href="produtos.php?categoria=<?= $cat['id_categoria'] ?>" 
                   class="<?= ($categoria_id == $cat['id_categoria']) ? 'button-fill' : 'button-contoured' ?>">
                   <?= htmlspecialchars($cat['nome']) ?>
                </a>
            <?php endforeach; ?>
        </div>
        
        <div class="product-grid">
            <?php if (!empty($produtos)): ?>
                <?php foreach ($produtos as $prod): ?>
                    <a href="detalhes.php?id=<?= $prod['id_produto'] ?>" class="product-card">
                        <div class="card-image">
                            <img class="card-img-lbl" 
                                 src="<?= !empty($prod['imagem']) ? '../assets/uploads/' . $prod['imagem'] : '../assets/images/img-ic.svg' ?>" 
                                 alt="<?= htmlspecialchars($prod['nome']) ?>">
                        </div>
                        <div class="card-info">
                            <h3 class="card-i-h3"><?= htmlspecialchars($prod['nome']) ?></h3>
                            
                            <?php if(!empty($prod['nome_categoria'])): ?>
                                <small style="color: #888; font-size: 0.8rem;"><?= htmlspecialchars($prod['nome_categoria']) ?></small>
                            <?php endif; ?>

                            <p class="price">R$ <?= number_format($prod['preco'], 2, ',', '.') ?></p>
                            <span class="btn-see-more">Ver Detalhes</span>
                        </div>
                    </a>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="no-products">
                    <img src="../assets/icons/interface/search-icon.svg" alt="Ícone de busca" style="width: 50px; opacity: 0.5; margin-bottom: 10px;">
                    <p>Nenhum produto encontrado.</p>
                    <?php if($busca || $categoria_id || $filtro_tipo): ?>
                        <a href="produtos.php" style="color: var(--color-1); text-decoration: underline;">Ver todos os produtos</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <?php
    // FOOTER //
    require_once '../components/footer/footer.php';
    // HOVER NAV //
    require_once '../components/hover-nav/hover-nav.php';
    // V LIBRAS //
    require_once '../components/vlibras-comp.php';
    ?>
</body>
</html>