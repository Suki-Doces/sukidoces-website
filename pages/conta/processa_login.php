<?php
session_start();
require_once __DIR__ . '/../../database/database.php';

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';
$role  = $_POST['role'] ?? '';

if (empty($email) || empty($senha) || empty($role)) {
    $_SESSION['mensagem_erro'] = "Preencha todos os campos.";
    header("Location: login.php");
    exit;
}

// Escolhe tabela conforme tipo de usuário
if ($role === 'admin') {
    $sql = "SELECT * FROM administradores WHERE email = :email";
} else {
    $sql = "SELECT * FROM usuario WHERE email = :email";
}

$stmt = $pdo->prepare($sql);
$stmt->bindParam(':email', $email, PDO::PARAM_STR);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // Verifica senha (usa hash se existir, senão texto puro)
    if (password_verify($senha, $user['senha']) || $user['senha'] === $senha) {
        $_SESSION['user_id'] = $role === 'admin' ? $user['id_admin'] : $user['id_usuario'];
        $_SESSION['user_role'] = $role;
        $_SESSION['user_nome'] = $user['nome'];

        if ($role === 'admin') {
            header("Location: ../dashboard/painel_admin.php"); // Anteriormente como dashboard/painel-admin.php
        } else {
            header("Location: ../../");
        }
        exit;
    }
}

$_SESSION['mensagem_erro'] = "Email ou senha incorretos.";
header("Location: login.php");
exit;
?>
