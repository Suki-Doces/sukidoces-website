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

// Buscar informações do admin
// Buscar informações do admin
$stmt = $pdo->prepare("SELECT * FROM administradores WHERE id_admin = ?");
$stmt->execute([$_SESSION['user_id']]);
$admin = $stmt->fetch();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"/>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/sidebar.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/configuracoes.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/page-headers.css">
    <title>Configurações</title>
</head>
    <?php include_once __DIR__ . '/../../include/sidebar.php'; ?>
    <main class="main-content">
        <div id="content-settings" class="content active">
            <h1>Configurações</h1>
            <p class="page-subtitle">Gerencie suas informações aqui!</p>
        </div>

        <?php if (!empty($_GET['sucesso'])): ?>
            <div class="success-box" style="background:#d4edda;color:#155724;padding:12px;border-radius:8px;margin:16px;border:1px solid #c3e6cb;">
                ✓ Alterações salvas com sucesso!
            </div>
        <?php endif; ?>

        <?php if (!empty($_GET['erro'])): ?>
            <div class="error-box" style="background:#f8d7da;color:#721c24;padding:12px;border-radius:8px;margin:16px;border:1px solid #f5c6cb;">
                ✗ <?= htmlspecialchars(urldecode($_GET['erro'])) ?>
            </div>
        <?php endif; ?>

        <div class="settings-container">
        <form id="configForm" method="POST" action="<?= BASE_URL ?>/pages/settings/processa_config.php">
            <section class="profile-section">
                <h2>Perfil</h2>
                
                <div class="form-group">
                    <label>Nome completo</label>
                    <input type="text" name="nome" value="<?= htmlspecialchars($admin['nome']) ?>" required>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="<?= htmlspecialchars($admin['email']) ?>" required>
                </div>

                <h3>Alterar Senha</h3>
                <div class="form-group">
                    <label>Senha atual</label>
                    <input type="password" name="senha_atual">
                </div>

                <div class="form-group">
                    <label>Nova senha</label>
                    <input type="password" name="nova_senha">
                </div>

                <div class="form-group">
                    <label>Confirmar nova senha</label>
                    <input type="password" name="confirma_senha">
                </div>

                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </section>
        </form>
        </div>
    </main>
    <script src="<?= BASE_URL ?>/js/sidebar.js"></script>
</body>
</html>