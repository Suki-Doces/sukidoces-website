<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';
include_once __DIR__ . '/../../include/vlibras.php';

// Verifica se o usuário está logado e é admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../conta/login.php");
    exit;
}

// Buscar estatísticas de clientes
$stmtTotal = $pdo->query("SELECT COUNT(*) as total FROM clientes");
$totalClientes = $stmtTotal->fetch()['total'] ?? 0;

$stmtNovos = $pdo->query("SELECT COUNT(*) as novos FROM clientes WHERE DATE(data_cadastro) >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
$novosClientes = $stmtNovos->fetch()['novos'] ?? 0;

// Verifica se a coluna `status` existe na tabela `clientes` para evitar erro SQL
try {
    $colStmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'status'");
    $colStmt->execute([':db' => 'loja_suki_doces']);
    $hasStatus = (int)$colStmt->fetchColumn() > 0;
} catch (Exception $e) {
    // Em caso de erro, assume que a coluna não existe (mais seguro)
    $hasStatus = false;
}

// Verifica também se existe a coluna `status_id`
try {
    $colStmt2 = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'status_id'");
    $colStmt2->execute([':db' => 'loja_suki_doces']);
    $hasStatusId = (int)$colStmt2->fetchColumn() > 0;
} catch (Exception $e) {
    $hasStatusId = false;
}


// Buscar todos os clientes com total de pedidos (join com usuario para pegar pedidos)
if ($hasStatus) {
    $statusSelect = "c.status AS status, NULL AS status_id";
} elseif ($hasStatusId) {
    // mapear status_id para 'ativo'/'inativo' para uso na UI (assumindo 1=ativo)
    $statusSelect = "c.status_id AS status_id, CASE WHEN c.status_id = 1 THEN 'ativo' ELSE 'inativo' END AS status";
} else {
    $statusSelect = "'ativo' AS status, NULL AS status_id";
}

$sql = "
    SELECT 
        c.id_cliente,
        c.nome,
        c.telefone,
        c.email,
        {$statusSelect},
        COALESCE(SUM(p.valor_total), 0) as valor_total,
        COUNT(p.id_pedido) as total_pedidos
    FROM clientes c
    LEFT JOIN usuario u ON c.email = u.email
    LEFT JOIN pedidos p ON u.id_usuario = p.id_usuario
    GROUP BY c.id_cliente
    ORDER BY c.data_cadastro DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute();
$clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clientes</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/cliente.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/pedidos.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">
    <style>
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
        .modal.active { display: flex; align-items: center; justify-content: center; }
        .modal-content { background-color: #fff; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { margin: 0; }
        .close-modal { background: none; border: none; font-size: 28px; cursor: pointer; color: #666; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
        .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .btn-cancel { background: #ccc; color: #333; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-save { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-save:hover { background: #45a049; }
        .success-box { background: #d4edda; color: #155724; padding: 12px; border-radius: 8px; margin: 16px; border: 1px solid #c3e6cb; }
        .error-box { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 8px; margin: 16px; border: 1px solid #f5c6cb; }
        .btn-edit, .btn-trash { background: none; border: none; cursor: pointer; font-size: 20px; }
        .btn-new { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn-new:hover { background: #45a049; }
    </style>
</head>
<body>
    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>
    
    <main class="main-content">
        <div id="content-clients" class="content">
            <h1>Clientes</h1>
            <p class="page-subtitle">Gerencie seus Usuários aqui.</p>
        </div>

        <?php if (!empty($_GET['sucesso'])): ?>
            <div class="success-box">✓ Operação realizada com sucesso!</div>
        <?php endif; ?>

        <?php if (!empty($_GET['erro'])): ?>
            <div class="error-box">✗ <?= htmlspecialchars(urldecode($_GET['erro'])) ?></div>
        <?php endif; ?>

        <section class="section-vendas">
            <div class="painel-vendas">
                <div class="dash-vendas padding-20-set">
                    <div>
                        <div class="revenue">
                            <b class="revenue-title">Clientes Totais</b>
                            <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="Icone de Pontos">
                        </div>
                        <div class="vendas-text">
                            <p>Registrados no sistema</p>
                        </div>
                    </div>
                    <div>
                        <div class="revenue-value">
                            <b class="revenue-text"><?= $totalClientes ?></b>
                        </div>
                    </div>
                </div>
  
                <div class="dash-pedidos padding-20-set">
                    <div>
                        <div class="revenue">
                            <b class="revenue-title">Novos Clientes</b>
                            <img class="dots-icons" src="<?= BASE_URL ?>/assets/icon/Dots - Icon.svg" alt="Icone de Pontos">
                        </div>
                        <div class="pedidos-text">
                            <p>Últimos 7 dias</p>
                        </div>
                    </div>
                    <div>
                        <div class="revenue-value">
                            <b class="revenue-text"><?= $novosClientes ?></b>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="container">
            <div class="tbl_container">
                <div class="header-container">
                    <button class="btn-new" onclick="openAddModal()">
                        <span class="material-symbols-rounded">add</span>
                        Adicionar Novo Cliente
                    </button>
                </div>
                <table class="tbl">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Total Gasto</th>
                            <th>Pedidos</th>
                            <th>Status</th>
                            <th colspan="2">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($clientes as $cliente): ?>
                            <tr>
                                <td data-label="ID">#<?= str_pad($cliente['id_cliente'], 4, '0', STR_PAD_LEFT) ?></td>
                                <td data-label="Nome"><?= htmlspecialchars($cliente['nome']) ?></td>
                                <td data-label="Telefone"><?= htmlspecialchars($cliente['telefone'] ?? '-') ?></td>
                                <td data-label="Email"><?= htmlspecialchars($cliente['email']) ?></td>
                                <td data-label="Total">R$ <?= number_format($cliente['valor_total'], 2, ',', '.') ?></td>
                                <td data-label="Pedidos"><?= $cliente['total_pedidos'] ?></td>
                                <td data-label="Status">
                                    <?php if ($cliente['status'] === 'ativo'): ?>
                                        <img src="<?= BASE_URL ?>/assets/icon/Green-Ball.svg" alt="Ativo" style="width:12px;height:12px;">
                                        <span style="color:#21c45d;">Ativo</span>
                                    <?php else: ?>
                                        <img src="<?= BASE_URL ?>/assets/icon/Red Ball - Icon.svg" alt="Inativo" style="width:12px;height:12px;">
                                        <span style="color:#ef4343;">Inativo</span>
                                    <?php endif; ?>
                                </td>
                                <td data-label="Editar">
                                    <button class="btn-edit" onclick="openEditModal(<?= htmlspecialchars(json_encode($cliente)) ?>)" title="Editar">
                                        <span class="material-symbols-rounded">edit</span>
                                    </button>
                                </td>
                                <td data-label="Deletar">
                                    <button class="btn-trash" onclick="deleteCliente(<?= $cliente['id_cliente'] ?>)" title="Deletar">
                                        <span class="material-symbols-rounded">delete</span>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- Modal para Adicionar/Editar Cliente -->
    <div id="clienteModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Adicionar Cliente</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <form id="clienteForm" onsubmit="handleFormSubmit(event)">
                <input type="hidden" id="clienteId" name="id_cliente">
                
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="nome" name="nome" required>
                </div>

                <div class="form-group">
                    <label>Senha *</label>
                    <input type="password" id="senha" name="senha" required>
                </div>

                <div class="form-group" id="statusGroup" style="display:none;">
                    <label>Status</label>
                    <select id="status" name="status">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-save">Salvar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const BASE_URL = '<?= BASE_URL ?>';
        const CLIENT_HAS_STATUS = <?= ($hasStatus || $hasStatusId) ? 'true' : 'false' ?>;
        let isEditMode = false;

        function openAddModal() {
            isEditMode = false;
            document.getElementById('modalTitle').textContent = 'Adicionar Cliente';
            document.getElementById('clienteForm').reset();
            document.getElementById('clienteId').value = '';
            // mostrar/esconder status dependendo se a coluna existe
            document.getElementById('statusGroup').style.display = CLIENT_HAS_STATUS ? 'block' : 'none';
            document.getElementById('clienteModal').classList.add('active');
        }

        function openEditModal(cliente) {
            isEditMode = true;
            document.getElementById('modalTitle').textContent = 'Editar Cliente';
            document.getElementById('clienteId').value = cliente.id_cliente;
            document.getElementById('nome').value = cliente.nome;
            // Preencher status: servidor provê `status` textual e opcionalmente `status_id`
            const statusVal = cliente.status || (cliente.status_id == 1 ? 'ativo' : 'inativo');
            document.getElementById('status').value = statusVal;
            document.getElementById('statusGroup').style.display = CLIENT_HAS_STATUS ? 'block' : 'none';
            document.getElementById('clienteModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('clienteModal').classList.remove('active');
        }

        function handleFormSubmit(event) {
            event.preventDefault();
            const formData = new FormData(document.getElementById('clienteForm'));
            const url = BASE_URL + '/pages/client/processa_cliente.php';

            fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    window.location.href = BASE_URL + '/pages/client/clientes.php?sucesso=1';
                } else {
                    alert('Erro: ' + (data.erro || 'Operação falhou'));
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao processar requisição');
            });
        }

        function deleteCliente(id) {
            if (confirm('Tem certeza que deseja deletar este cliente?')) {
                fetch(BASE_URL + '/pages/client/processa_cliente.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'acao=deletar&id_cliente=' + id
                })
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        window.location.href = BASE_URL + '/pages/client/clientes.php?sucesso=1';
                    } else {
                        alert('Erro: ' + (data.erro || 'Operação falhou'));
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro ao deletar cliente');
                });
            }
        }

        // Fechar modal ao clicar fora
        window.onclick = function(event) {
            const modal = document.getElementById('clienteModal');
            if (event.target === modal) {
                closeModal();
            }
        }
    </script>

    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
</body>
</html>