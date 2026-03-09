<?php
// pages/order/update_status.php
session_start();
require_once __DIR__ . '/../../database/database.php';

header('Content-Type: application/json');

// Segurança: Apenas admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id_pedido = $data['id'] ?? null;
$novo_status = $data['status'] ?? null;

if (!$id_pedido || !$novo_status) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

$statusPermitidos = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];
if (!in_array($novo_status, $statusPermitidos)) {
    echo json_encode(['success' => false, 'message' => 'Status inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE pedidos SET status = :status WHERE id_pedido = :id");
    $stmt->execute([':status' => $novo_status, ':id' => $id_pedido]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados']);
}
?>