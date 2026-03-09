<?php
session_start();
require_once __DIR__ . '/../../include/config.php';
require_once __DIR__ . '/../../database/database.php';

header('Content-Type: application/json');

// Verifica se o usuário está logado e é admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['sucesso' => false, 'erro' => 'Acesso negado']);
    exit;
}

$acao = $_POST['acao'] ?? ($_POST['id_cliente'] ? 'editar' : 'adicionar');

// Verifica se a coluna `status` existe na tabela `clientes`
try {
    $colStmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'status'");
    $colStmt->execute([':db' => 'loja_suki_doces']);
    $hasStatus = (int)$colStmt->fetchColumn() > 0;
} catch (Exception $e) {
    $hasStatus = false;
}

// Verifica se existe a coluna `status_id` (uso de FK para tabela de status)
try {
    $colStmt2 = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'status_id'");
    $colStmt2->execute([':db' => 'loja_suki_doces']);
    $hasStatusId = (int)$colStmt2->fetchColumn() > 0;
} catch (Exception $e) {
    $hasStatusId = false;
}

try {
    if ($acao === 'deletar') {
        // ========== DELETAR CLIENTE ==========
        $id_cliente = intval($_POST['id_cliente'] ?? 0);
        
        if ($id_cliente <= 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID inválido']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM clientes WHERE id_cliente = ?");
        $stmt->execute([$id_cliente]);

        echo json_encode(['sucesso' => true, 'mensagem' => 'Cliente deletado com sucesso']);

    } elseif ($acao === 'editar') {
        // ========== EDITAR CLIENTE ==========
        $id_cliente = intval($_POST['id_cliente'] ?? 0);
        $nome = trim($_POST['nome'] ?? '');
        $senha = $_POST['senha'] ?? '';

        // Validações básicas
        if ($id_cliente <= 0) {
            echo json_encode(['sucesso' => false, 'erro' => 'ID inválido']);
            exit;
        }
        if (empty($nome)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Nome é obrigatório']);
            exit;
        }

        // Se a tabela usa coluna textual `status` (ENUM), valide; se usa `status_id`, converta mapa
        if ($hasStatus) {
            $status = $_POST['status'] ?? 'ativo';
            if (!in_array($status, ['ativo', 'inativo'])) {
                echo json_encode(['sucesso' => false, 'erro' => 'Status inválido']);
                exit;
            }
        }

        if ($hasStatusId) {
            $rawStatus = $_POST['status'] ?? null;
            if ($rawStatus === null) {
                // manter padrão
                $status_id = null;
            } elseif (is_numeric($rawStatus)) {
                $status_id = intval($rawStatus);
            } else {
                // aceitar 'ativo'/'inativo' string e mapear para 1/0
                if ($rawStatus === 'ativo') {
                    $status_id = 1;
                } elseif ($rawStatus === 'inativo') {
                    $status_id = 0;
                } else {
                    echo json_encode(['sucesso' => false, 'erro' => 'Status inválido']);
                    exit;
                }
            }
        }

        // Montar UPDATE dinamicamente conforme colunas disponíveis
        $campos = ["nome = ?"];
        $valores = [$nome];

        if ($hasStatus) {
            $campos[] = "status = ?";
            $valores[] = $status;
        }

        if ($hasStatusId) {
            // somente adiciona se foi enviado um valor válido (não nulo)
            if (isset($status_id)) {
                $campos[] = "status_id = ?";
                $valores[] = $status_id;
            }
        }

        if (!empty($senha)) {
            if (strlen($senha) < 6) {
                echo json_encode(['sucesso' => false, 'erro' => 'Senha deve ter no mínimo 6 caracteres']);
                exit;
            }
            $campos[] = "senha = ?";
            $valores[] = password_hash($senha, PASSWORD_DEFAULT);
        }

        $valores[] = $id_cliente;
        $sql = "UPDATE clientes SET " . implode(', ', $campos) . " WHERE id_cliente = ?";

        // Se o client enviou um campo 'status' mas a coluna não existe, registre aviso
        $ignoredStatus = false;
        if (!$hasStatus && array_key_exists('status', $_POST)) {
            $ignoredStatus = true;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($valores);

        $response = ['sucesso' => true, 'mensagem' => 'Cliente atualizado com sucesso'];
        if ($ignoredStatus) {
            $response['aviso'] = 'Coluna status não existe no banco; o valor de status não foi alterado. Execute /add_status_column.php para habilitar.';
        }

        echo json_encode($response);

    } else {
        // ========== ADICIONAR CLIENTE ==========
        $nome = trim($_POST['nome'] ?? '');
        $senha = $_POST['senha'] ?? '';

        // Validações
        if (empty($nome)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Nome é obrigatório']);
            exit;
        }
        if (empty($senha) || strlen($senha) < 6) {
            echo json_encode(['sucesso' => false, 'erro' => 'Senha deve ter no mínimo 6 caracteres']);
            exit;
        }

        // Gerar email único (opcional, ou pedir para o usuário)
        $email = strtolower(str_replace(' ', '', $nome)) . '@gerado.local';
        
        // Verificar se email já existe
        $stmtEmail = $pdo->prepare("SELECT id_cliente FROM clientes WHERE email = ?");
        $stmtEmail->execute([$email]);
        $counter = 1;
        while ($stmtEmail->fetch()) {
            $email = strtolower(str_replace(' ', '', $nome)) . $counter . '@gerado.local';
            $stmtEmail->execute([$email]);
            $counter++;
        }

        // Inserir novo cliente na tabela 'clientes'
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO clientes (nome, email, senha, data_cadastro)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$nome, $email, $senhaHash]);

        echo json_encode(['sucesso' => true, 'mensagem' => 'Cliente criado com sucesso']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
