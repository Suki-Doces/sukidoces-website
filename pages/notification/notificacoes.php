<?php 
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';
include_once __DIR__ . '/../../include/vlibras.php';

session_start();

// Bloqueia acesso de não administradores
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: " . BASE_URL . "/pages/conta/login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificações - Suki Doces</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/notification.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/notifications-improvements.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">
</head>

<body>
    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>

    <main class="main-content">
        <div id="content-notifications" class="content">
            <h1>Notificação</h1>
            <p class="page-subtitle">Gerencie suas Mensagens aqui.</p>
        </div>

        <div class="container">
            <div class="notificationContainer">
                <button class="mark-as-read" id="mark-as-read">Marcar mensagens como lidas!</button>

                <div class="notificationCard unread">
                    <img class="cupom-img" alt="icon" src="<?= BASE_URL ?>/assets/icon/Cupom - icon.svg" />
                    <div class="description">
                        <p>O Cliente Ruben Amorin usou o cupom de 20% na sua compra.</p>
                        <p id="notif-time">1m ago</p>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>

                <div class="notificationCard unread">
                    <img class="Compra - Icon" alt="icon" src="<?= BASE_URL ?>/assets/icon/Payment - icon.svg" />
                    <div class="description">
                        <p>Nova compra realizada número do Pedido #00399</p>
                        <p id="notif-time">1m ago</p>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>

                <div class="notificationCard">
                    <img alt="photo" src="<?= BASE_URL ?>/assets/icon/Storage - icon.svg" />
                    <div class="description">
                        <p>Acabou o estoque do produto Minalba 250ml</p>
                        <p id="notif-time">1m ago</p>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>

                <div class="notificationCard">
                    <img alt="photo" src="<?= BASE_URL ?>/assets/icon/Star (Deluxe).svg" />
                    <div class="description">
                        <p>Cliente Rafael Costa avaliou o produto Energético Monster 473ml com 5 estrelas.</p>
                        <p id="notif-time">1m ago</p>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>

                <div class="notificationCard">
                    <img alt="photo" src="<?= BASE_URL ?>/assets/icon/User - icon.svg"/>
                    <div class="description">
                        <p>Novo cadastro! Larissa Almeida criou uma conta na sua loja.</p>
                        <p id="notif-time">1m ago</p>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>
            </div>
        </div>
    </main>

    <script>const BASE_URL = '<?= BASE_URL ?>';</script>
    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
    <script src="<?= BASE_URL ?>/js/notification.js" defer></script>
</body>
</html>
