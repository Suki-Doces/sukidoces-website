<?php
session_start();
require_once __DIR__ . '/../../database/database.php';

// 1. Verificação de Segurança: Usuário deve estar logado
if (!isset($_SESSION['user_id'])) {
    header("Location: ../conta/login.php");
    exit;
}

$id_usuario = $_SESSION['user_id'];
$mensagem = '';
$tipo_msg = '';

// 2. Processamento de Formulários (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // --- ATUALIZAR DADOS PESSOAIS ---
    if (isset($_POST['acao']) && $_POST['acao'] === 'atualizar_dados') {
        $novo_nome = filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_SPECIAL_CHARS);
        $novo_telefone = filter_input(INPUT_POST, 'telefone', FILTER_SANITIZE_SPECIAL_CHARS);
        
        try {
            $pdo->beginTransaction();
            
            // Atualiza tabela de usuários (Login)
            $stmtUser = $pdo->prepare("UPDATE usuario SET nome = ? WHERE id_usuario = ?");
            $stmtUser->execute([$novo_nome, $id_usuario]);
            
            // Atualiza sessão para refletir mudança imediata no Header
            $_SESSION['user_nome'] = $novo_nome;

            // Atualiza ou Cria na tabela Clientes (Dados detalhados)
            // Primeiro pegamos o email para vincular
            $stmtEmail = $pdo->prepare("SELECT email FROM usuario WHERE id_usuario = ?");
            $stmtEmail->execute([$id_usuario]);
            $emailUser = $stmtEmail->fetchColumn();

            // Verifica se já existe em clientes
            $checkCliente = $pdo->prepare("SELECT id_cliente FROM clientes WHERE email = ?");
            $checkCliente->execute([$emailUser]);
            $idCliente = $checkCliente->fetchColumn();

            if ($idCliente) {
                $stmtCli = $pdo->prepare("UPDATE clientes SET nome = ?, telefone = ? WHERE id_cliente = ?");
                $stmtCli->execute([$novo_nome, $novo_telefone, $idCliente]);
            } else {
                // Se não existir, cria
                $stmtCli = $pdo->prepare("INSERT INTO clientes (nome, email, telefone, data_cadastro) VALUES (?, ?, ?, NOW())");
                $stmtCli->execute([$novo_nome, $emailUser, $novo_telefone]);
            }

            $pdo->commit();
            $mensagem = "Dados atualizados com sucesso!";
            $tipo_msg = "success";

        } catch (Exception $e) {
            $pdo->rollBack();
            $mensagem = "Erro ao atualizar: " . $e->getMessage();
            $tipo_msg = "error";
        }
    }

    // --- ALTERAR SENHA ---
    if (isset($_POST['acao']) && $_POST['acao'] === 'alterar_senha') {
        $senha_nova = $_POST['nova_senha'];
        $senha_confirma = $_POST['confirma_senha'];

        if ($senha_nova === $senha_confirma && !empty($senha_nova)) {
            // Em um cenário real, verificaríamos a senha antiga aqui também
            $hash = password_hash($senha_nova, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("UPDATE usuario SET senha = ? WHERE id_usuario = ?");
            if ($stmt->execute([$hash, $id_usuario])) {
                $mensagem = "Senha alterada com sucesso!";
                $tipo_msg = "success";
            } else {
                $mensagem = "Erro ao alterar senha.";
                $tipo_msg = "error";
            }
        } else {
            $mensagem = "As senhas não conferem.";
            $tipo_msg = "error";
        }
    }

    // --- EXCLUIR CONTA ---
    if (isset($_POST['acao']) && $_POST['acao'] === 'excluir_conta') {
        try {
            // A lógica de exclusão depende das restrições do banco (FKs).
            // Geralmente deletamos o usuário e deixamos o histórico de pedidos anonimizado ou deletamos tudo.
            // Aqui vamos tentar deletar o usuário.
            
            $stmt = $pdo->prepare("DELETE FROM usuario WHERE id_usuario = ?");
            $stmt->execute([$id_usuario]);
            
            // Destrói sessão
            session_destroy();
            header("Location: ../../index.php"); // Volta para home deslogado
            exit;

        } catch (Exception $e) {
            $mensagem = "Não foi possível excluir a conta (verifique pendências de pedidos).";
            $tipo_msg = "error";
        }
    }
}

// 3. Buscar Dados Atuais para Exibição
$stmt = $pdo->prepare("
    SELECT u.nome, u.email, c.telefone 
    FROM usuario u 
    LEFT JOIN clientes c ON u.email = c.email 
    WHERE u.id_usuario = ?
");
$stmt->execute([$id_usuario]);
$dados = $stmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Perfil - Suki Doces</title>
    
    <link rel="stylesheet" href="../../style.css">
    <link rel="stylesheet" href="../../components/header/header.css">
    
    <link rel="stylesheet" href="../conta/conta.css">
    
    <style>
        .profile-container {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .profile-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            border: 1px solid var(--color-4);
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .profile-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--color-5);
            padding-bottom: 15px;
        }

        .profile-avatar {
            width: 80px;
            height: 80px;
            background-color: var(--color-5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .profile-avatar img {
            width: 40px;
            height: 40px;
        }

        .profile-title h1 {
            color: var(--t-color-3);
            margin-bottom: 5px;
        }
        
        .profile-title p {
            color: var(--t-color-7);
        }

        /* Reaproveitando classes do conta.css com ajustes */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .full-width {
            grid-column: span 2;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .input-group label {
            font-weight: 600;
            color: var(--t-color-3);
            font-size: 0.9rem;
        }

        /* Mensagens */
        .alert {
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .alert.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

        /* Área de perigo */
        .danger-zone {
            border: 1px solid #f5c6cb;
            background: #fff5f5;
        }
        
        .danger-zone h2 {
            color: #721c24;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }

        .btn-delete {
            background-color: transparent;
            border: 1px solid #dc3545;
            color: #dc3545;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-delete:hover {
            background-color: #dc3545;
            color: white;
        }

        @media (max-width: 600px) {
            .form-grid { grid-template-columns: 1fr; }
            .full-width { grid-column: span 1; }
        }
    </style>
</head>
<body>
    
    <?php require_once '../../components/header/header.php'; ?>

    <main class="profile-container">
        
        <?php if ($mensagem): ?>
            <div class="alert <?= $tipo_msg ?>">
                <?= htmlspecialchars($mensagem) ?>
            </div>
        <?php endif; ?>

        <section class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="../../assets/icons/interface/profile-icon.svg" alt="Avatar">
                </div>
                <div class="profile-title">
                    <h1>Meus Dados</h1>
                    <p>Gerencie suas informações pessoais</p>
                </div>
            </div>

            <form method="POST" action="perfil.php">
                <input type="hidden" name="acao" value="atualizar_dados">
                
                <div class="form-grid">
                    <div class="input-group full-width">
                        <label>Nome Completo</label>
                        <input type="text" name="nome" class="login-input" value="<?= htmlspecialchars($dados['nome']) ?>" required>
                    </div>

                    <div class="input-group">
                        <label>Email (Não alterável)</label>
                        <input type="email" class="login-input" value="<?= htmlspecialchars($dados['email']) ?>" disabled style="background: #e9ecef; cursor: not-allowed;">
                    </div>

                    <div class="input-group">
                        <label>Telefone / WhatsApp</label>
                        <input type="text" name="telefone" class="login-input" value="<?= htmlspecialchars($dados['telefone'] ?? '') ?>" placeholder="(11) 99999-9999">
                    </div>
                </div>

                <div style="margin-top: 20px; text-align: right;">
                    <button type="submit" class="button-fill" style="width: auto; padding: 12px 30px; display:inline-flex;">
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </section>

        <section class="profile-card">
            <div class="profile-header" style="border-bottom: none; margin-bottom: 10px;">
                <div class="profile-title">
                    <h2 style="color: var(--t-color-3);">Alterar Senha</h2>
                </div>
            </div>

            <form method="POST" action="perfil.php">
                <input type="hidden" name="acao" value="alterar_senha">
                
                <div class="form-grid">
                    <div class="input-group">
                        <label>Nova Senha</label>
                        <input type="password" name="nova_senha" class="login-input" placeholder="Mínimo 6 caracteres" required minlength="6">
                    </div>

                    <div class="input-group">
                        <label>Confirmar Nova Senha</label>
                        <input type="password" name="confirma_senha" class="login-input" placeholder="Repita a senha" required minlength="6">
                    </div>
                </div>

                <div style="margin-top: 20px; text-align: right;">
                    <button type="submit" class="button-contoured" style="width: auto; padding: 10px 20px; display:inline-flex;">
                        Atualizar Senha
                    </button>
                </div>
            </form>
        </section>

        <section class="profile-card danger-zone">
            <h2>Excluir Conta</h2>
            <p style="margin-bottom: 20px; color: #555; font-size: 0.9rem;">
                Ao excluir sua conta, você perderá acesso ao seu histórico de pedidos e seus dados serão removidos do nosso sistema. Essa ação é irreversível.
            </p>
            
            <form method="POST" action="perfil.php" onsubmit="return confirm('Tem certeza absoluta? Esta ação não pode ser desfeita.');">
                <input type="hidden" name="acao" value="excluir_conta">
                <button type="submit" class="btn-delete">
                    Excluir minha conta permanentemente
                </button>
            </form>
        </section>

    </main>

    <?php 
    require_once '../../components/footer/footer.php'; 
    require_once '../../components/hover-nav/hover-nav.php'; 
    require_once '../../components/vlibras-comp.php'; 
    ?>

</body>
</html>