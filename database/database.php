<?php
// database/database.php
$host = 'host'; // End-Point -> Host Banco de Dados
$dbname = 'database_name'; // Banco de Dados
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    // Em produção, registre o erro em log e não exiba detalhes ao usuário
    die("Erro de conexão com o banco de dados.");
}
?>