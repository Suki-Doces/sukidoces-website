<?php
session_start();
require_once __DIR__ . '/../../database/database.php';

// Auth Check
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    header("Location: ../conta/login.php");
    exit;
}

$acao = $_POST['acao'] ?? '';
$nome = trim($_POST['nome'] ?? '');
$descricao = trim($_POST['descricao'] ?? '');
$id = intval($_POST['id_categoria'] ?? 0);

try {
    if ($acao === 'adicionar') {
        if (empty($nome)) die('Nome obrigatório');
        
        $stmt = $pdo->prepare("INSERT INTO categorias (nome, descricao) VALUES (?, ?)");
        $stmt->execute([$nome, $descricao]);
        
    } elseif ($acao === 'editar') {
        if (empty($nome) || $id <= 0) die('Dados inválidos');

        $stmt = $pdo->prepare("UPDATE categorias SET nome = ?, descricao = ? WHERE id_categoria = ?");
        $stmt->execute([$nome, $descricao, $id]);

    } elseif ($acao === 'deletar') {
        if ($id <= 0) die('ID inválido');

        // Nota: O banco está configurado com ON DELETE SET NULL em produtos, 
        // então produtos dessa categoria ficarão com id_categoria = NULL.
        $stmt = $pdo->prepare("DELETE FROM categorias WHERE id_categoria = ?");
        $stmt->execute([$id]);
    }

    header("Location: categorias.php?sucesso=1");
    exit;

} catch (PDOException $e) {
    die("Erro ao processar: " . $e->getMessage());
}
?>