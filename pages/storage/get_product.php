<?php
require_once __DIR__ . '/../../database/database.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET["id"])) {
    echo json_encode(["erro" => "ID não informado"]);
    exit;
}

$id = intval($_GET["id"]);

$sql = $pdo->prepare("SELECT * FROM produtos WHERE id_produto = ?");
$sql->execute([$id]);
$produto = $sql->fetch(PDO::FETCH_ASSOC);

echo json_encode($produto);
