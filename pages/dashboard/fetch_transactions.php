<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode([]);
    exit;
}

$last = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;

try {
        $sql = "SELECT p.id_pedido,
                    u.nome AS cliente_nome,
                    '' AS endereco,
                    p.data_pedido,
                    p.status,
                    p.valor_total
              FROM pedidos p
              LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
              WHERE p.id_pedido > ?
              ORDER BY p.id_pedido ASC
              LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$last]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'DB error']);
}

?>
