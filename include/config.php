<?php
// Configuração básica de caminhos
// Ajuste BASE_URL se o projeto for servido em um subdiretório diferente
if (!defined('BASE_URL')) {
    // Assumimos que o projeto está em /Loja_Suki_Adm quando servido via localhost
    define('BASE_URL', '/sukidoces-website-skd-v2.0');
}

// Caminho absoluto do diretório raiz do projeto (filesystem)
if (!defined('BASE_DIR')) {
    // __DIR__ está em include/, então um nível acima é a raiz do projeto
    define('BASE_DIR', realpath(__DIR__ . '/..'));
}

?>
