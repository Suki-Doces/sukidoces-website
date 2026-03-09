<?php
session_start();
require_once __DIR__ . "/../../include/config.php";
require_once __DIR__ . "/../../database/database.php";
include_once __DIR__ . "/../../include/vlibras.php";

// Verifica se está logado e é admin
if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    header("Location: ../conta/login.php");
    exit;
}

// Buscar produtos
$stmt = $pdo->prepare("SELECT * FROM produtos ORDER BY id_produto DESC");
$stmt->execute();
$produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/storage.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/estoque.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/mini-table.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">

    <title>Estoque</title>

    <style>
        .container { padding: 0 20px; }
        .tbl_container h3 { margin-bottom: 10px; }
        .tbl_container a { display: inline-block; margin-bottom: 15px; }
        .btn-edit, .btn-editar { cursor: pointer; }
        .kit-img { width: 60px; border-radius: 6px; }

        /* Fundo do modal */
        .modal {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.25s ease;
        }

        .modal.hidden {
        opacity: 0;
        pointer-events: none;
        }

        /* Conteúdo do modal */
        .modal-content {
        background: #ffffff;
        padding: 25px;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        animation: popup 0.25s ease;
        }

        /* Animação suave */
        @keyframes popup {
        from {
            transform: scale(0.92);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
        }

        /* Botão fechar */
        .modal-close {
        float: right;
        cursor: pointer;
        background: transparent;
        border: none;
        font-size: 1.4rem;
        color: #555;
        transition: 0.2s;
        }

        .modal-close:hover {
        color: #000;
        }


    </style>
</head>

<body>
    <?php include_once __DIR__ . "/../../include/sidebar.php"; ?>

    <main class="main-content">

        <div id="content-dashboard" class="content active">
            <h1>Estoque</h1>
            <p class="page-subtitle">Gerencie seu Armazenamento aqui.</p>
        </div>

        <br><br>

        <section class="primary-container">
            <div class="table_container">
                
                <h3>Produtos Cadastrados</h3>
                <a href="<?= BASE_URL ?>/pages/product/produtos.php">+ Adicionar Novo Produto</a>

                <table class="primary-table">
                    <thead class="table-head">
                        <tr>
                            <th class="table-parent">Produto</th>
                            <th class="table-parent">Nome</th>
                            <th class="table-parent">Quantidade</th>
                            <th class="table-parent">Valor</th>
                            <th class="table-parent">Data</th>
                            <th colspan="2">Ação</th>
                        </tr>
                    </thead>

                    <tbody>
                        <?php foreach ($produtos as $p): ?>
                        <tr class="active-row" data-id="<?= $p['id_produto'] ?>">

                            <!-- Imagem -->
                            <td>
                                <img class="kit-img" src="<?= BASE_URL ?>/assets/uploads/<?= $p['imagem'] ?>" alt="img">
                            </td>

                            <!-- Nome -->
                            <td>
                                <span class="kit-text"><?= htmlspecialchars($p['nome']) ?></span>
                            </td>

                            <!-- Quantidade -->
                            <td><?= $p['quantidade'] ?></td>

                            <!-- Valor -->
                            <td>R$ <?= number_format($p['preco'], 2, ',', '.') ?></td>

                            <!-- Data -->
                            <td>
                                <?= date("d/m/Y", strtotime($p['data_criacao'])) ?>
                            </td>

                            <!-- Editar -->
                            <td>
                                <button type="button" class="btn-edit open-edit" data-id="<?= $p['id_produto'] ?>" aria-label="Editar produto">
                                    
                                <img src="<?= BASE_URL ?>/assets/icon/Editar-Icon.svg" alt="Editar">
                                </button>
                            </td>
                            <!-- Deletar -->
                            <td>
                                <button type="button" class="btn-trash btn-trash-btn" data-id="<?= $p['id_produto'] ?>" aria-label="Deletar produto">
                                    <img src="<?= BASE_URL ?>/assets/icon/Trash - Icon.svg" alt="Deletar">
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>

                </table>
            </div>
        </section>
    </main>

    <script src="<?= BASE_URL ?>/js/script.js"></script>
    <script>const BASE_URL = '<?= BASE_URL ?>';</script>
    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
    <script src="<?= BASE_URL ?>/js/estoque.js"></script>

    <!-- Modal container para edição rápida -->
    <div id="editModal" class="modal hidden" aria-hidden="true">
        <div class="modal-content">
            <button id="editModalClose" class="modal-close" aria-label="Fechar">✕</button>
            <div id="editModalBody"> </div>
        </div>
    </div>

</body>
</html>


