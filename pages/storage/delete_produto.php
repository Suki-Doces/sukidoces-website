<?php
session_start();
require_once __DIR__ . "/../../include/config.php";
require_once __DIR__ . "/../../database/database.php";

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    echo "Não autorizado.";
    exit;
}

if (!isset($_GET["id"])) {
    echo "ID não informado.";
    exit;
}

$id = intval($_GET["id"]);

// Remove do banco
try {
    $stmt = $pdo->prepare("DELETE FROM produtos WHERE id_produto = ?");
    $stmt->execute([$id]);
    echo "OK";
} catch (Exception $e) {
    echo "Erro ao deletar: " . $e->getMessage();
}

