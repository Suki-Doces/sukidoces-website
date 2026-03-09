<?php
require_once "../../database/database.php";

$id = $_GET['id'] ?? 0;

$stmt = $pdo->prepare("SELECT * FROM pedidos WHERE id_pedido = ?");
$stmt->execute([$id]);
$pedido = $stmt->fetch();

if (!$pedido) {
    die("Pedido não encontrado");
}
?>

<h1>Detalhes do Pedido #<?= $pedido['id_pedido'] ?></h1>

<p><strong>Cliente:</strong> <?= htmlspecialchars($pedido['cliente_nome']) ?></p>
<p><strong>Data:</strong> <?= date('d/m/Y H:i', strtotime($pedido['data'])) ?></p>
<p><strong>Status:</strong> <?= ucfirst($pedido['status']) ?></p>
<p><strong>Total:</strong> R$ <?= number_format($pedido['total'], 2, ',', '.') ?></p>

<a href="pedidos.php">← Voltar</a>

<form method="POST" action="processa_status.php">
    <input type="hidden" name="id_pedido" value="<?= $pedido['id_pedido'] ?>">

    <label>Mudar status:</label>
    <select name="status">
        <option value="pendente">Pendente</option>
        <option value="concluido">Concluído</option>
        <option value="cancelado">Cancelado</option>
    </select>

    <button type="submit">Salvar</button>
</form>

