<?php
// pages/order/pedidos.php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';
include_once __DIR__ . '/../../include/vlibras.php';

// Verifica se o usuário está logado e é admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../conta/login.php");
    exit;
}

// --- LÓGICA DE FILTRO E BUSCA ---
$filtroStatus = $_GET['status'] ?? 'todos';
$busca = $_GET['search'] ?? '';

// Query Base
$sql = "
    SELECT 
        p.id_pedido, 
        p.data_pedido, 
        p.status, 
        p.valor_total,
        u.nome as cliente_nome,
        -- Tenta buscar endereço concatenado (Logradouro, Numero - Cidade)
        CONCAT(e.logradouro, ', ', e.numero, ' - ', e.cidade) as endereco_entrega
    FROM pedidos p
    LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
    -- Join complexo para achar o endereço via email (já que pedidos liga a usuario, e enderecos liga a clientes)
    LEFT JOIN clientes c ON u.email = c.email
    LEFT JOIN enderecos e ON c.id_cliente = e.id_cliente
";

$conditions = [];
$params = [];

// Filtro por Status
if ($filtroStatus !== 'todos') {
    $conditions[] = "p.status = :status";
    $params[':status'] = $filtroStatus;
}

// Filtro de Busca (ID ou Nome)
if (!empty($busca)) {
    $conditions[] = "(p.id_pedido LIKE :busca OR u.nome LIKE :busca)";
    $params[':busca'] = "%$busca%";
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$sql .= " GROUP BY p.id_pedido ORDER BY p.data_pedido DESC LIMIT 50";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $pedidos = [];
}

// Contadores para os cards do topo (estatísticas rápidas)
$totalPedidos = $pdo->query("SELECT COUNT(*) FROM pedidos")->fetchColumn();
$totalPendentes = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status = 'pendente'")->fetchColumn();
$totalCancelados = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status = 'cancelado'")->fetchColumn();
$totalConcluidos = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status = 'entregue'")->fetchColumn(); // Assumindo entregue como concluído
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Pedidos</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/pedidos.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/table.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/orders-improvements.css">
    <style>
        /* CSS Específico para Botões de Ação na Tabela */
        .btn-action {
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: 0.2s;
        }
        .btn-dispatch {
            background-color: #3b82f6;
            color: white;
        }
        .btn-dispatch:hover { background-color: #2563eb; }
        
        .btn-deliver {
            background-color: #10b981;
            color: white;
        }
        .btn-deliver:hover { background-color: #059669; }

        .btn-cancel-sm {
            background-color: #fee2e2;
            color: #ef4444;
        }
        .btn-cancel-sm:hover { background-color: #fca5a5; }

        .action-cell {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        
        /* Ajuste responsivo para a tabela não quebrar */
        @media (max-width: 768px) {
            .table-body table { min-width: 800px; } /* Força scroll horizontal no mobile */
            .table-body { overflow-x: auto; }
        }
    </style>
</head>
<body>

    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>

    <main class="main-content">

        <div id="content-orders" class="content active">
            <h1>Pedidos</h1>
            <p>Gerencie o fluxo de envios e entregas.</p>
        </div>

        <section class="section-vendas">
            <div class="painel-vendas">
                <div class="dash-vendas padding-20-set">
                    <div>
                        <div class="revenue">
                            <b class="revenue-title">Total</b>
                            <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="...">
                        </div>
                        <div class="vendas-text"><p>Todos os tempos</p></div>
                    </div>
                    <div>
                        <div class="revenue-value">
                            <b class="revenue-text"><?= $totalPedidos ?></b>
                        </div>
                    </div>
                </div>

                <div class="dash-pedidos padding-20-set">
                    <div>
                        <div class="revenue">
                            <b class="revenue-title">Concluídos</b>
                            <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="...">
                        </div>
                        <div class="pedidos-text"><p>Entregues</p></div>
                    </div>
                    <div>
                        <div class="revenue-value">
                            <b class="revenue-text"><?= $totalConcluidos ?></b>
                        </div>
                    </div>
                </div>

                <div class="dash-pendentes padding-20-set">
                    <div class="dash-p-title">
                        <div class="revenue">
                            <b class="revenue-title">Pendentes / Cancelados</b>
                            <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="...">
                        </div>
                    </div>
                    <div class="dash-p-dados">
                        <div class="pend-canc-pai">
                            <b class="pendentes-text">Pendentes</b>
                            <b class="pen-value-text"><?= $totalPendentes ?></b>
                        </div>
                        <img class="traco-icon" src="<?= BASE_URL ?>/assets/icon/Traco - Icon.svg" alt="|">
                        <div class="cancelados-parent">
                            <b class="cancelados">Cancelados</b>
                            <b class="cash"><?= $totalCancelados ?></b>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer class="table">
            <section class="table_header">
                <form method="GET" class="input-group">
                    <input type="search" name="search" placeholder="ID ou Nome do Cliente..." value="<?= htmlspecialchars($busca) ?>">
                    <button type="submit" style="background:none; border:none; cursor:pointer;">
                        <img src="<?= BASE_URL ?>/assets/icon/Lupa - icon.svg" alt="Pesquisar">
                    </button>
                </form>

                <div class="table_order">
                    <a href="?status=todos" class="table_pedidos <?= ($filtroStatus == 'todos') ? 'active' : '' ?>">Todos</a>
                    <a href="?status=pendente" class="table_pendentes <?= ($filtroStatus == 'pendente') ? 'active' : '' ?>">Pendentes</a>
                    <a href="?status=enviado" class="table_pedidos <?= ($filtroStatus == 'enviado') ? 'active' : '' ?>">Enviados</a>
                    <a href="?status=entregue" class="table_concluidos <?= ($filtroStatus == 'entregue') ? 'active' : '' ?>">Entregues</a>
                    <a href="?status=cancelado" class="table_cancelados <?= ($filtroStatus == 'cancelado') ? 'active' : '' ?>">Cancelados</a>
                </div>
            </section>

            <section class="table_body">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Endereço</th>
                            <th>Data</th>
                            <th class="status-th">Status</th>
                            <th>Valor</th>
                            <th>Ações</th> </tr>
                    </thead>
                    <tbody id="orders-tbody">
                        <?php if (count($pedidos) > 0): ?>
                            <?php foreach ($pedidos as $p): ?>
                                <tr id="row-<?= $p['id_pedido'] ?>">
                                    <td>#<?= str_pad($p['id_pedido'], 4, '0', STR_PAD_LEFT) ?></td>
                                    <td><?= htmlspecialchars($p['cliente_nome']) ?></td>
                                    <td title="<?= htmlspecialchars($p['endereco_entrega'] ?? '') ?>">
                                        <?= htmlspecialchars(mb_strimwidth($p['endereco_entrega'] ?? 'Retirada na Loja', 0, 25, "...")) ?>
                                    </td>
                                    <td><?= date('d/m/Y', strtotime($p['data_pedido'])) ?></td>
                                    <td>
                                        <p class="status <?= strtolower($p['status']) ?>" id="status-text-<?= $p['id_pedido'] ?>">
                                            <?= ucfirst($p['status']) ?>
                                        </p>
                                    </td>
                                    <td><strong>R$ <?= number_format($p['valor_total'], 2, ',', '.') ?></strong></td>
                                    
                                    <td class="action-cell" id="actions-<?= $p['id_pedido'] ?>">
                                        <?php if ($p['status'] === 'pago'): ?>
                                            <button class="btn-action btn-dispatch" onclick="updateStatus(<?= $p['id_pedido'] ?>, 'enviado')">
                                                <span class="material-symbols-rounded" style="font-size:16px">local_shipping</span>
                                                Despachar
                                            </button>
                                        <?php elseif ($p['status'] === 'enviado'): ?>
                                            <button class="btn-action btn-deliver" onclick="updateStatus(<?= $p['id_pedido'] ?>, 'entregue')">
                                                <span class="material-symbols-rounded" style="font-size:16px">check_circle</span>
                                                Entregue
                                            </button>
                                        <?php elseif ($p['status'] === 'pendente'): ?>
                                            <span style="font-size: 0.8rem; color: #888;">Aguard. Pagto</span>
                                        <?php elseif ($p['status'] === 'entregue'): ?>
                                            <span style="font-size: 0.8rem; color: green;">Concluído</span>
                                        <?php else: ?>
                                            <span style="font-size: 0.8rem; color: #ccc;">-</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" style="text-align:center; padding: 20px;">Nenhum pedido encontrado.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </section>
        </footer>

    </main>

    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
    
    <script>
        async function updateStatus(idPedido, novoStatus) {
            if(!confirm(`Deseja alterar o status do pedido #${idPedido} para ${novoStatus.toUpperCase()}?`)) return;

            try {
                const response = await fetch('update_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idPedido, status: novoStatus })
                });

                const result = await response.json();

                if (result.success) {
                    // Atualiza a UI visualmente sem recarregar
                    const statusText = document.getElementById(`status-text-${idPedido}`);
                    const actionsCell = document.getElementById(`actions-${idPedido}`);
                    
                    // Atualiza classe e texto do badge
                    statusText.className = `status ${novoStatus}`;
                    statusText.textContent = novoStatus.charAt(0).toUpperCase() + novoStatus.slice(1);

                    // Atualiza os botões dinamicamente
                    if (novoStatus === 'enviado') {
                        actionsCell.innerHTML = `
                            <button class="btn-action btn-deliver" onclick="updateStatus(${idPedido}, 'entregue')">
                                <span class="material-symbols-rounded" style="font-size:16px">check_circle</span>
                                Entregue
                            </button>`;
                    } else if (novoStatus === 'entregue') {
                        actionsCell.innerHTML = `<span style="font-size: 0.8rem; color: green;">Concluído</span>`;
                    }

                } else {
                    alert('Erro ao atualizar: ' + (result.message || 'Desconhecido'));
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão.');
            }
        }
    </script>
</body>
</html>