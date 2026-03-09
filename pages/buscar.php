<?php
// search.php
$query = $_GET['query'] ?? '';
// Redireciona para a página de produtos passando a busca
header("Location: ./pages/produtos.php?query=" . urlencode($query));
exit;
?>