<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../conta/login.php");
    exit;
}

$id_admin = $_SESSION['user_id'];
$nome = trim($_POST['nome'] ?? '');
$email = trim($_POST['email'] ?? '');
$senha_atual = $_POST['senha_atual'] ?? '';
$nova_senha = $_POST['nova_senha'] ?? '';
$confirma_senha = $_POST['confirma_senha'] ?? '';

// Validações básicas
$erros = [];

if (empty($nome)) {
    $erros[] = 'Nome não pode estar vazio';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'Email inválido';
}

// Se tentar alterar senha, validar
if (!empty($senha_atual) || !empty($nova_senha) || !empty($confirma_senha)) {
    if (empty($senha_atual) || empty($nova_senha) || empty($confirma_senha)) {
        $erros[] = 'Para alterar senha, preencha todos os campos de senha';
    } elseif ($nova_senha !== $confirma_senha) {
        $erros[] = 'As novas senhas não conferem';
    } elseif (strlen($nova_senha) < 6) {
        $erros[] = 'Nova senha deve ter no mínimo 6 caracteres';
    } else {
        // Verifica senha atual
        $stmtSenha = $pdo->prepare("SELECT senha FROM administradores WHERE id_admin = ?");
        $stmtSenha->execute([$id_admin]);
        $senhaBanco = $stmtSenha->fetchColumn();

        if (!password_verify($senha_atual, $senhaBanco)) {
            $erros[] = 'Senha atual está incorreta';
        }
    }
}

// Se houver erros, redirecionar com mensagem
if (!empty($erros)) {
    header('Location: ' . BASE_URL . '/pages/settings/configuracoes.php?erro=' . urlencode(implode('; ', $erros)));
    exit;
}

try {
    // Atualizar nome e email
    $sql = "UPDATE administradores SET nome = ?, email = ? WHERE id_admin = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nome, $email, $id_admin]);

    // Atualizar senha se foi validada
    if (!empty($nova_senha) && !empty($senha_atual)) {
        $novaHash = password_hash($nova_senha, PASSWORD_DEFAULT);
        $updateSenha = $pdo->prepare("UPDATE administradores SET senha = ? WHERE id_admin = ?");
        $updateSenha->execute([$novaHash, $id_admin]);
    }

    header('Location: ' . BASE_URL . '/pages/settings/configuracoes.php?sucesso=1');
    exit;
} catch (Exception $e) {
    header('Location: ' . BASE_URL . '/pages/settings/configuracoes.php?erro=' . urlencode('Erro ao salvar alterações'));
    exit;
}
?>