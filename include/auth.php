<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    header('Location: ../conta/conta.php');
    exit;
}
?>
