<?php 
require_once __DIR__ . '/../../database/database.php';
session_start();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Pedido Confirmado - Suki Doces</title>
    <link rel="stylesheet" href="../../style.css">
    <style>
        .success-container {
            text-align: center;
            padding: 80px 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        .success-icon {
            width: 80px;
            height: 80px;
            background: #d4edda;
            color: #155724;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin: 0 auto 20px;
        }
        .btn-home {
            display: inline-block;
            margin-top: 30px;
            padding: 12px 30px;
            background: var(--color-1);
            color: white;
            border-radius: 20px;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <?php require_once '../../components/header/header.php'; ?>

    <main class="success-container">
        <div class="success-icon">✓</div>
        <h1 style="color: var(--t-color-3);">Pedido Realizado com Sucesso!</h1>
        <p>O número do seu pedido é: <strong>#<?= htmlspecialchars($_GET['pedido'] ?? '---') ?></strong></p>
        <p>Você receberá os detalhes no seu e-mail em breve.</p>
        
        <a href="../../index.php" class="btn-home">Voltar para a Home</a>
    </main>

    <?php require_once '../../components/footer/footer.php'; ?>
</body>
</html>