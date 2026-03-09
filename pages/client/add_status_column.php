<?php
// add_status_column.php
// Helper simples para adicionar/ajustar a coluna `status` em `clientes`.
// Uso: abra no browser: http://localhost/Loja_Suki_Adm/add_status_column.php

require_once __DIR__ . '/database/database.php';

try {
    // Verifica se a coluna já existe
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'status'");
    $stmt->execute([':db' => 'loja_suki_doces']);
    $exists = (int)$stmt->fetchColumn() > 0;

    if ($exists) {
        // Se existe, tenta alterar o tipo para ENUM correto
        $sql = "ALTER TABLE `clientes` MODIFY COLUMN `status` ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo'";
        $pdo->exec($sql);
        echo "Coluna 'status' já existia — tipo atualizado para ENUM('ativo','inativo') com DEFAULT 'ativo'.";
    } else {
        // Cria a coluna
        $sql = "ALTER TABLE `clientes` ADD COLUMN `status` ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo' AFTER `senha'`";
        // Nota: fallback sem AFTER se erro
        try {
            $pdo->exec($sql);
            echo "Coluna 'status' adicionada com sucesso (ENUM('ativo','inativo'), DEFAULT 'ativo').";
        } catch (PDOException $e) {
            // Tenta sem AFTER (caso a coluna 'senha' não exista ou nome diferente)
            $sql2 = "ALTER TABLE `clientes` ADD COLUMN `status` ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo'";
            $pdo->exec($sql2);
            echo "Coluna 'status' adicionada com sucesso (fallback sem posição).";
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo "Erro ao modificar a tabela clientes: " . htmlspecialchars($e->getMessage());
}

?>
