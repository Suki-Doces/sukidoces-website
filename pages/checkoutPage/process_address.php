<?php
// pages/checkoutPage/salvar_endereco.php
session_start();
require_once __DIR__ . '/../../database/database.php';

if (!isset($_SESSION['user_id']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../conta/login.php");
    exit;
}

$id_usuario = $_SESSION['user_id'];

// Dados do formulário
$telefone = filter_input(INPUT_POST, 'telefone', FILTER_SANITIZE_SPECIAL_CHARS);
$cep = filter_input(INPUT_POST, 'cep', FILTER_SANITIZE_SPECIAL_CHARS);
$logradouro = filter_input(INPUT_POST, 'logradouro', FILTER_SANITIZE_SPECIAL_CHARS);
$numero = filter_input(INPUT_POST, 'numero', FILTER_SANITIZE_SPECIAL_CHARS);
$complemento = filter_input(INPUT_POST, 'complemento', FILTER_SANITIZE_SPECIAL_CHARS);
$bairro = filter_input(INPUT_POST, 'bairro', FILTER_SANITIZE_SPECIAL_CHARS);
$cidade = filter_input(INPUT_POST, 'cidade', FILTER_SANITIZE_SPECIAL_CHARS);
$estado = filter_input(INPUT_POST, 'uf', FILTER_SANITIZE_SPECIAL_CHARS);

try {
    $pdo->beginTransaction();

    // 1. Descobrir o ID_CLIENTE e EMAIL baseado no ID_USUARIO da sessão
    // O banco separa 'usuario' (login) de 'clientes' (dados pessoais), vinculados pelo email (conforme seu SQL)
    $stmtUser = $pdo->prepare("SELECT email FROM usuario WHERE id_usuario = ?");
    $stmtUser->execute([$id_usuario]);
    $emailUser = $stmtUser->fetchColumn();

    if (!$emailUser) throw new Exception("Usuário não encontrado.");

    // Busca o cliente pelo email
    $stmtCliente = $pdo->prepare("SELECT id_cliente FROM clientes WHERE email = ?");
    $stmtCliente->execute([$emailUser]);
    $idCliente = $stmtCliente->fetchColumn();

    // Se por algum motivo não existir na tabela clientes, cria agora (segurança)
    if (!$idCliente) {
        $stmtInsertCli = $pdo->prepare("INSERT INTO clientes (nome, email, data_cadastro) SELECT nome, email, NOW() FROM usuario WHERE id_usuario = ?");
        $stmtInsertCli->execute([$id_usuario]);
        $idCliente = $pdo->lastInsertId();
    }

    // 2. Atualiza o Telefone do Cliente
    $stmtUpdateTel = $pdo->prepare("UPDATE clientes SET telefone = ? WHERE id_cliente = ?");
    $stmtUpdateTel->execute([$telefone, $idCliente]);

    // 3. Verifica se já tem endereço ou insere novo
    // Como o sistema parece suportar múltiplos endereços, vamos deletar o anterior para simplificar este checkout ou apenas inserir um novo.
    // Vamos optar por limpar endereços antigos para garantir que o atual seja o de entrega.
    $stmtDelEnd = $pdo->prepare("DELETE FROM enderecos WHERE id_cliente = ?");
    $stmtDelEnd->execute([$idCliente]);

    $stmtEnd = $pdo->prepare("INSERT INTO enderecos (id_cliente, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmtEnd->execute([$idCliente, $cep, $logradouro, $numero, $complemento, $bairro, $cidade, $estado]);

    $pdo->commit();
    
    // Recarrega o checkout
    header("Location: checkout.php");
    exit;

} catch (Exception $e) {
    $pdo->rollBack();
    die("Erro ao salvar endereço: " . $e->getMessage());
}
?>