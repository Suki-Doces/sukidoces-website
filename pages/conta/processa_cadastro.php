<?php
session_start();
require_once __DIR__ . '/../../database/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_SPECIAL_CHARS);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $senha = $_POST['senha'];

    if (empty($nome) || empty($email) || empty($senha)) {
        $_SESSION['mensagem_erro'] = "Preencha todos os campos.";
        header("Location: login.php");
        exit;
    }

    // Verifica se email já existe
    $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $_SESSION['mensagem_erro'] = "Este email já está cadastrado.";
        header("Location: login.php");
        exit;
    }

    // Criptografa a senha e insere
    $hash = password_hash($senha, PASSWORD_DEFAULT);
    
    try {
        // Inicia a transação (ou tudo dá certo, ou nada acontece)
        $pdo->beginTransaction();

        // 1. Insere na tabela USUARIO
        $sqlUser = "INSERT INTO usuario (nome, email, senha) VALUES (:nome, :email, :senha)";
        $stmtUser = $pdo->prepare($sqlUser);
        $stmtUser->bindParam(':nome', $nome);
        $stmtUser->bindParam(':email', $email);
        $stmtUser->bindParam(':senha', $hash);
        $stmtUser->execute();
        
        // (Opcional) Se você quiser usar o mesmo ID, pegaria aqui: $id_novo = $pdo->lastInsertId();

        // 2. Insere na tabela CLIENTES
        $sqlCliente = "INSERT INTO clientes (nome, email, senha, data_cadastro) VALUES (:nome, :email, :senha, NOW())";
        $stmtCliente = $pdo->prepare($sqlCliente);
        $stmtCliente->bindParam(':nome', $nome);
        $stmtCliente->bindParam(':email', $email);
        $stmtCliente->bindParam(':senha', $hash);
        $stmtCliente->execute();

        // Confirma as alterações
        $pdo->commit();

        $_SESSION['mensagem_erro'] = "Cadastro realizado! Faça login.";
        header("Location: login.php");
        
    } catch (PDOException $e) {
        // Se der erro, desfaz tudo
        $pdo->rollBack();
        $_SESSION['mensagem_erro'] = "Erro ao cadastrar: " . $e->getMessage();
        header("Location: login.php");
    }
}
?>