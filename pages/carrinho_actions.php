<?php
session_start();

require_once __DIR__ . '/../database/database.php';

// Inicializa o carrinho se não existir
if (!isset($_SESSION['carrinho'])) {
    $_SESSION['carrinho'] = [];
}

$acao = $_POST['acao'] ?? $_GET['acao'] ?? null;

if ($acao === 'adicionar') {
    $id_produto = (int)$_POST['id_produto'];
    $qtd = (int)$_POST['qtd'];

    if ($id_produto > 0 && $qtd > 0) {
        if (isset($_SESSION['carrinho'][$id_produto])) {
            $_SESSION['carrinho'][$id_produto] += $qtd;
        } else {
            $_SESSION['carrinho'][$id_produto] = $qtd;
        }
    }
    header("Location: carrinho.php");
    exit;
}

if ($acao === 'remover') {
    $id_produto = (int)$_GET['id'];
    if (isset($_SESSION['carrinho'][$id_produto])) {
        unset($_SESSION['carrinho'][$id_produto]);
    }
    header("Location: carrinho.php");
    exit;
}

if ($acao === 'atualizar') {
    $id_produto = (int)$_POST['id_produto'];
    $qtd = (int)$_POST['qtd'];

    if ($qtd > 0) {
        $_SESSION['carrinho'][$id_produto] = $qtd;
    } else {
        unset($_SESSION['carrinho'][$id_produto]);
    }
    header("Location: carrinho.php");
    exit;
}

header("Location: produtos.php");
exit;
?>