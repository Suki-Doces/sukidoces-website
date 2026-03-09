<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';
include_once __DIR__ . '/../../include/vlibras.php';

// Verifica se o usuário está logado e é admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}

// Buscando no Banco de Dados as informações necessárias para o Painel de Controle
// 1. Vendas Totais (Últimos 7 dias, status pago/enviado/entregue)
$sqlVendas = "SELECT SUM(valor_total) as total FROM pedidos 
              WHERE status IN ('pago', 'enviado', 'entregue') 
              AND data_pedido >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
$stmt = $pdo->query($sqlVendas);
$vendas7Dias = $stmt->fetch()['total'] ?? 0;

// 2. Pedidos Totais (Últimos 7 dias, todos os status)
$sqlPedidos = "SELECT COUNT(*) as total FROM pedidos 
               WHERE data_pedido >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
$stmt = $pdo->query($sqlPedidos);
$pedidos7Dias = $stmt->fetch()['total'] ?? 0;

// 3. Pendentes e Cancelados (Geral ou 7 dias? Vamos pegar Geral para ser um "To-Do list")
$pendentes = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status = 'pendente'")->fetchColumn();
$cancelados = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status = 'cancelado'")->fetchColumn();

// 4. Produtos em Destaque (Baseado na contagem de itens vendidos)
// Fazemos um LEFT JOIN com itens_pedido para contar quantas vezes foi vendido
$sqlProdutos = "SELECT p.id_produto, p.nome, p.preco, p.imagem, e.quantidade_atual, 
                (SELECT SUM(quantidade) FROM itens_pedido ip WHERE ip.id_produto = p.id_produto) as total_vendido
                FROM produtos p 
                LEFT JOIN estoque e ON p.id_produto = e.id_produto 
                ORDER BY total_vendido DESC LIMIT 4";
$stmt = $pdo->query($sqlProdutos);
$produtosDestaque = $stmt->fetchAll();

// 5. Gerenciamento de Estoque
$estoqueTotal = $pdo->query("SELECT SUM(quantidade_atual) FROM estoque")->fetchColumn() ?? 0;
$produtosRepor = $pdo->query("SELECT COUNT(*) FROM estoque WHERE quantidade_atual <= quantidade_minima")->fetchColumn();
// Devoluções (recentes cancelados)
$devolucoes = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status = 'cancelado' AND data_pedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();

// 6. Transações Recentes
$sqlTransacoes = "SELECT p.id_pedido, c.nome, p.data_pedido, p.status, p.valor_total 
                  FROM pedidos p 
                  JOIN usuario c ON p.id_usuario = c.id_usuario 
                  ORDER BY p.data_pedido DESC LIMIT 5";
$stmt = $pdo->query($sqlTransacoes);
$transacoes = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel</title>
    <!--Linking Google Fonts for icon-->
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/pedidos.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/orders-improvements.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/transaction.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/index.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">
</head>

<body>
    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>
    <main class="main-content">

        <div id="content-dashboard" class="content active">
            <h1>Painel</h1>
            <p class="page-subtitle">Bem-vindo ao seu Painel de Controle!</p>
        </div>

        <div class="painel-vendas">
            <div class="dash-vendas padding-20-set">
                <div>
                    <div class="revenue">
                        <b class="revenue-title">Vendas Totais</b>
                        <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="Icone de Pontos">
                    </div>
                    <div class="vendas-text">
                        <p>Vendas nos últimos 7 dias</p>
                    </div>
                </div>
                <div>
                    <div class="revenue-value">
                        <b class="revenue-text">R$ <?= number_format($vendas7Dias, 2, ',', '.') ?></b>
                        <div class="frame-wrapper">
                            <div class="increase-value">
                                <img class="porcentagem-de-incremento"
                                    src="<?= BASE_URL ?>/assets/icon/Increases Symbol - Icon.svg"
                                    alt="Icone de Aumento">
                            </div>
                        </div>
                        <b class="increase-text">--</b>
                    </div>
                    <div class="previous-days">
                        <span>Atualizado agora</span>
                        <!-- <b class="blue-value">(R$ 1640)</b> -->
                    </div>
                </div>
            </div>
            <div class="dash-pedidos padding-20-set">
                <div>
                    <div class="revenue">
                        <b class="revenue-title">Pedidos Totais</b>
                        <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="Icone de Pontos">
                    </div>
                    <div class="pedidos-text">
                        <p>Últimos 7 dias</p>
                    </div>
                </div>
                <div>
                    <div class="revenue-value">
                        <b class="revenue-text"><?= $pedidos7Dias ?></b>
                        <div class="frame-wrapper">
                            <div class="increase-value">
                                <img class="porcentagem-de-incremento"
                                    src="<?= BASE_URL ?>/assets/icon/Increases Symbol - Icon.svg"
                                    alt="Icone de Aumento">
                            </div>
                        </div>
                        <!-- <b class="increase-text">+17.4%</b> -->
                    </div>
                    <div class="previous-days">
                        <span>Volume recente</span>
                        <!-- <b class="blue-value">(R$ 1260)</b> -->
                    </div>
                </div>

            </div>

            <div class="dash-pendentes padding-20-set">
                <div class="dash-p-title">
                    <div class="revenue">
                        <b class="revenue-title">Status</b>
                        <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="Icone de Pontos">
                    </div>
                    <div class="vendas-text">
                        <p>Visão Geral</p>
                    </div>
                </div>
                <div class="dash-p-dados">
                    <div class="pend-canc-pai">
                        <b class="pendentes-text">Pendentes</b>
                        <b class="pen-value-text"><?= $pendentes ?></b>
                    </div>
                    <img class="traco-icon" src="<?= BASE_URL ?>/assets/icon/Traco - Icon.svg" alt="Icone de Traço">
                    <div class="cancelados-parent">
                        <b class="cancelados">Cancelados</b>
                        <b class="cash"><?= $cancelados ?></b>
                    </div>
                </div>
            </div>
        </div>

        <!-- Seção abaixo dos painéis de vendas: produtos em destaque (esquerda) e gerenciamento do estoque (direita) -->
        <section class="below-vendas">
            <div class="produtos-destaque-main">
                <h3>Produtos mais Vendidos</h3>
                <table class="content-table">
                    <thead class="table-head">
                        <tr>
                            <th class="table-parent">Produto</th>
                            <th class="table-parent">Vendas</th>
                            <th class="table-parent">Status</th>
                            <th class="table-parent">Valor</th>
                        </tr>
                    </thead>
                    <tbody id="featured-products-tbody">
                        <?php if (count($produtosDestaque) > 0): ?>
                            <?php foreach ($produtosDestaque as $prod): ?>
                                <?php
                                // Define status visual baseado no estoque
                                $qtd = $prod['quantidade_atual'];
                                $statusColor = $qtd > 0 ? '#21c45d' : '#ef4343'; // Verde ou Vermelho
                                $statusText = $qtd > 0 ? 'Em Estoque' : 'Esgotado';
                                $icon = $qtd > 0 ? 'Green-Ball.svg' : 'Red Ball - Icon.svg';

                                // Caminho da imagem (ajuste para o caminho relativo correto se necessário)
                                // Se a imagem no banco for 'assets/...', usamos BASE_URL/assets/...
                                // Se estiver salva como caminho completo, usa direto.
                                $imgSrc = !empty($prod['imagem']) ? BASE_URL . '/' . $prod['imagem'] : BASE_URL . '/assets/img/placeholder.jpg';
                                ?>
                                <tr class="active-row">
                                    <td style="display: flex; align-items: center;">
                                        <img class="kit-img" src="<?= $imgSrc ?>" alt="<?= htmlspecialchars($prod['nome']) ?>">
                                        <span class="kit-text"
                                            style="position:static; padding-left:10px;"><?= htmlspecialchars($prod['nome']) ?></span>
                                    </td>
                                    <td style="padding-left: 50px;"><?= $prod['total_vendido'] ?? 0 ?></td>
                                    <td>
                                        <img src="<?= BASE_URL ?>/assets/icon/<?= $icon ?>" alt="Status"
                                            style="vertical-align:middle; width:20px; height: 8px;">
                                        <span style="margin-left:6px; color:<?= $statusColor ?>;"><?= $statusText ?>
                                            (<?= $qtd ?>)</span>
                                    </td>
                                    <td>R$ <?= number_format($prod['preco'], 2, ',', '.') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="4">Nenhum produto vendido ainda.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <aside class="gerenciamento-estoque">
                <h3>Gerenciamento do Estoque</h3>
                <div class="estoque-cards">
                    <div class="estoque-item">
                        <span>Situação Estoque</span>
                        <b><?= $estoqueTotal ?></b>
                    </div>
                    <div class="estoque-item">
                        <span>Produtos a Repor</span>
                        <b style="color: <?= $produtosRepor > 0 ? 'red' : 'inherit' ?>"><?= $produtosRepor ?></b>
                    </div>
                    <div class="estoque-item">
                        <span>Cancelamentos (30d)</span>
                        <b><?= $devolucoes ?></b>
                    </div>
                </div>
            </aside>
        </section>

        <div class="transacoes-section">
            <div class="table-transacoes">
                <h1>Transações Recentes</h1>
            </div>
        
            <div class="table-trans-body">
                <table>
                    <thead>
                        <tr>
                            <th class="th-trans">ID Pedido</th>
                            <th class="th-trans">Cliente</th>
                            <th class="th-trans">Data</th>
                            <th class="th-trans">Status</th>
                            <th class="th-trans">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if(count($transacoes) > 0): ?>
                            <?php foreach($transacoes as $trans): ?>
                                <?php
                                    // Ícone e cor baseado no status
                                    $status = strtolower($trans['status']);
                                    $iconStatus = 'Yellow - Ball.svg'; // Padrão pendente
                                    if(in_array($status, ['pago', 'entregue', 'enviado'])) $iconStatus = 'Green-Ball.svg';
                                    if($status == 'cancelado') $iconStatus = 'Red Ball - Icon.svg';
                                    
                                    $dataFmt = date('d/m | H:i', strtotime($trans['data_pedido']));
                                ?>
                                <tr>
                                    <td class="td-trans">#<?= $trans['id_pedido'] ?></td>
                                    <td class="td-trans"><?= htmlspecialchars($trans['nome']) ?></td>
                                    <td class="td-trans"><?= $dataFmt ?></td>
                                    <td class="td-trans" style="text-transform: capitalize;">
                                        <img src="<?= BASE_URL ?>/assets/icon/<?= $iconStatus ?>" alt="">
                                        <?= $status ?>
                                    </td>
                                    <td class="td-trans">R$ <?= number_format($trans['valor_total'], 2, ',', '.') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr><td colspan="5" class="td-trans">Nenhuma transação encontrada.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
    <script>const BASE_URL = '<?= BASE_URL ?>';</script>
    <script src="<?= BASE_URL ?>/js/transactions-polling.js" defer></script>
    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
</body>

</html>