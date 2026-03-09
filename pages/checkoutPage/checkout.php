<?php
session_start();
require_once __DIR__ . '/../../database/database.php'; 

// Verifica se está logado
if (!isset($_SESSION['user_id'])) {
    $_SESSION['redirect_after_login'] = 'pages/checkoutPage/checkout.php'; 
    header("Location: ../conta/login.php");
    exit;
}

// Verifica carrinho
if (empty($_SESSION['carrinho'])) {
    header("Location: ../carrinho.php"); 
    exit;
}

$id_usuario = $_SESSION['user_id'];

// ==========================================================================
// 1. VERIFICAÇÃO DE DADOS CADASTRAIS (ENDEREÇO E TELEFONE)
// ==========================================================================

// Busca o email do usuário logado
$stmtUser = $pdo->prepare("SELECT email FROM usuario WHERE id_usuario = ?");
$stmtUser->execute([$id_usuario]);
$emailUser = $stmtUser->fetchColumn();

// Busca dados do cliente e endereço vinculado
$dadosCompletos = false;
$cliente = [];
$endereco = [];

if ($emailUser) {
    // Busca cliente e telefone
    $stmtCli = $pdo->prepare("SELECT * FROM clientes WHERE email = ?");
    $stmtCli->execute([$emailUser]);
    $cliente = $stmtCli->fetch(PDO::FETCH_ASSOC);

    if ($cliente) {
        // Busca endereço
        $stmtEnd = $pdo->prepare("SELECT * FROM enderecos WHERE id_cliente = ? LIMIT 1");
        $stmtEnd->execute([$cliente['id_cliente']]);
        $endereco = $stmtEnd->fetch(PDO::FETCH_ASSOC);

        // Define se está completo: Tem telefone E tem endereço cadastrado
        if (!empty($cliente['telefone']) && $endereco) {
            $dadosCompletos = true;
        }
    }
}

// ==========================================================================
// 2. CÁLCULOS DO CARRINHO (Mantido do seu original)
// ==========================================================================
$ids = implode(',', array_keys($_SESSION['carrinho']));
$sql = "SELECT * FROM produtos WHERE id_produto IN ($ids)";
$stmt = $pdo->query($sql);
$produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

$subtotal = 0;
foreach ($produtos as $prod) {
    $qtd = $_SESSION['carrinho'][$prod['id_produto']];
    $subtotal += $prod['preco'] * $qtd;
}
$frete = 10.00; 
$total = $subtotal + $frete;
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Finalizar Compra - Suki Doces</title>
    <link rel="stylesheet" href="../../style.css">
    <link rel="stylesheet" href="./checkout.css"> 
    
    <script>
    function limpa_formulário_cep() {
            document.getElementById('rua').value=("");
            document.getElementById('bairro').value=("");
            document.getElementById('cidade').value=("");
            document.getElementById('uf').value=("");
    }

    function meu_callback(conteudo) {
        if (!("erro" in conteudo)) {
            document.getElementById('rua').value=(conteudo.logradouro);
            document.getElementById('bairro').value=(conteudo.bairro);
            document.getElementById('cidade').value=(conteudo.localidade);
            document.getElementById('uf').value=(conteudo.uf);
            document.getElementById('numero').focus();
        } else {
            limpa_formulário_cep();
            alert("CEP não encontrado.");
        }
    }

    function pesquisacep(valor) {
        var cep = valor.replace(/\D/g, '');
        if (cep != "") {
            var validacep = /^[0-9]{8}$/;
            if(validacep.test(cep)) {
                document.getElementById('rua').value="...";
                document.getElementById('bairro').value="...";
                document.getElementById('cidade').value="...";
                document.getElementById('uf').value="...";
                var script = document.createElement('script');
                script.src = 'https://viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';
                document.body.appendChild(script);
            } else {
                limpa_formulário_cep();
                alert("Formato de CEP inválido.");
            }
        } else {
            limpa_formulário_cep();
        }
    };
    </script>
</head>
<body>
    <?php require_once '../../components/header/header.php'; ?>

    <main class="checkout-container">
        
        <div>
            <?php if (!$dadosCompletos): ?>
                
                <section class="checkout-section">
                    <h2 class="checkout-title">Endereço de Entrega</h2>
                    <p style="margin-bottom: 20px; color: #666;">Precisamos do seu endereço e telefone para enviar os doces!</p>
                    
                    <form action="process_address.php" method="POST" class="card-form">
                        
                        <div class="form-group full-width">
                            <label>Telefone / WhatsApp</label>
                            <input type="text" name="telefone" placeholder="(11) 99999-9999" required value="<?= htmlspecialchars($cliente['telefone'] ?? '') ?>">
                        </div>

                        <div class="form-group">
                            <label>CEP</label>
                            <input type="text" name="cep" id="cep" placeholder="00000-000" maxlength="9" onblur="pesquisacep(this.value);" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Cidade</label>
                            <input type="text" name="cidade" id="cidade" readonly required style="background: #f9f9f9;">
                        </div>

                        <div class="form-group full-width">
                            <label>Rua / Logradouro</label>
                            <input type="text" name="logradouro" id="rua" required>
                        </div>

                        <div class="form-group">
                            <label>Número</label>
                            <input type="text" name="numero" id="numero" required>
                        </div>

                        <div class="form-group">
                            <label>Estado</label>
                            <input type="text" name="uf" id="uf" readonly required style="background: #f9f9f9;">
                        </div>

                        <div class="form-group">
                            <label>Bairro</label>
                            <input type="text" name="bairro" id="bairro" required>
                        </div>

                        <div class="form-group">
                            <label>Complemento</label>
                            <input type="text" name="complemento" placeholder="Apto, Bloco, etc.">
                        </div>

                        <div class="full-width">
                            <button type="submit" class="btn-finalize" style="margin-top:10px;">Salvar e Continuar</button>
                        </div>
                    </form>
                </section>

            <?php else: ?>

                <form action="process_checkout.php" method="POST" id="checkoutForm">
                    <section class="checkout-section">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #fee3ea; padding-bottom: 10px; margin-bottom: 20px;">
                            <h2 class="checkout-title" style="border:none; margin:0;">Pagamento</h2>
                            <span style="font-size: 0.9rem; color: #666;">
                                Enviando para: <strong><?= htmlspecialchars($endereco['logradouro']) ?>, <?= htmlspecialchars($endereco['numero']) ?></strong>
                                <br><a href="salvar_endereco.php?acao=reset" onclick="alert('Funcionalidade de editar pendente de implementação'); return false;" style="color:var(--color-1); font-size:0.8rem;">Alterar endereço (Fale conosco)</a>
                            </span>
                        </div>
                        
                        <div class="payment-options">
                            
                            <div class="payment-method" id="method-pix">
                                <div class="method-header">
                                    <input type="radio" name="metodo_pagamento" value="pix" id="pix" required onclick="togglePayment('pix')">
                                    <label for="pix">PIX (Aprovação Imediata)</label>
                                </div>
                                <div class="method-body" id="body-pix">
                                    <p style="text-align: center; color: #666;">
                                        O código QR Code será gerado na próxima tela.<br>
                                        <strong style="color: var(--color-1);">Desconto de 5% no PIX!</strong>
                                    </p>
                                </div>
                            </div>

                            <div class="payment-method" id="method-cartao">
                                <div class="method-header">
                                    <input type="radio" name="metodo_pagamento" value="cartao" id="cartao" onclick="togglePayment('cartao')">
                                    <label for="cartao">Cartão de Crédito</label>
                                </div>
                                <div class="method-body" id="body-cartao">
                                    <div class="card-form">
                                        <div class="form-group full-width">
                                            <label>Número do Cartão</label>
                                            <input type="text" name="card_number" placeholder="0000 0000 0000 0000" maxlength="19">
                                        </div>
                                        <div class="form-group full-width">
                                            <label>Nome Impresso no Cartão</label>
                                            <input type="text" name="card_name" placeholder="Como no cartão">
                                        </div>
                                        <div class="form-group">
                                            <label>Validade</label>
                                            <input type="text" name="card_expiry" placeholder="MM/AA" maxlength="5">
                                        </div>
                                        <div class="form-group">
                                            <label>CVV</label>
                                            <input type="text" name="card_cvv" placeholder="123" maxlength="3">
                                        </div>
                                        <div class="form-group full-width">
                                            <label>Parcelas</label>
                                            <select name="parcelas" style="width: 100%; padding: 10px; border-radius: 8px; border:1px solid #ccc;">
                                                <option value="1">1x de R$ <?= number_format($total, 2, ',', '.') ?> (sem juros)</option>
                                                <option value="2">2x de R$ <?= number_format($total/2, 2, ',', '.') ?> (sem juros)</option>
                                                <option value="3">3x de R$ <?= number_format($total/3, 2, ',', '.') ?> (sem juros)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="payment-method" id="method-boleto">
                                <div class="method-header">
                                    <input type="radio" name="metodo_pagamento" value="boleto" id="boleto" onclick="togglePayment('boleto')">
                                    <label for="boleto">Boleto Bancário</label>
                                </div>
                                <div class="method-body" id="body-boleto">
                                    <p style="color: #666;">Vencimento em 3 dias úteis. O pedido será enviado após a compensação bancária.</p>
                                </div>
                            </div>

                        </div>
                    </section>
                </form>
            <?php endif; ?>
        </div>

        <aside class="checkout-section" style="height: fit-content;">
            <h2 class="checkout-title">Resumo do Pedido</h2>
            
            <?php foreach ($produtos as $prod): ?>
            <div class="summary-item">
                <span><?= $_SESSION['carrinho'][$prod['id_produto']] ?>x <?= htmlspecialchars($prod['nome']) ?></span>
                <span>R$ <?= number_format($prod['preco'] * $_SESSION['carrinho'][$prod['id_produto']], 2, ',', '.') ?></span>
            </div>
            <?php endforeach; ?>
            
            <div class="summary-item" style="margin-top: 15px; border-top: 1px dashed #ddd; padding-top:10px;">
                <span>Subtotal</span>
                <span>R$ <?= number_format($subtotal, 2, ',', '.') ?></span>
            </div>
            <div class="summary-item">
                <span>Frete</span>
                <span>R$ <?= number_format($frete, 2, ',', '.') ?></span>
            </div>

            <div class="total-row">
                <span>Total</span>
                <span>R$ <?= number_format($total, 2, ',', '.') ?></span>
            </div>

            <?php if ($dadosCompletos): ?>
                <button type="submit" form="checkoutForm" class="btn-finalize">Finalizar Pedido</button>
            <?php else: ?>
                <button type="button" class="btn-finalize" style="opacity: 0.5; cursor: not-allowed;" disabled>Preencha o endereço</button>
            <?php endif; ?>
            
            <a href="../carrinho.php" style="display:block; text-align:center; margin-top:10px; color: #888;">Voltar ao carrinho</a>
        </aside>
    </main>

    <?php require_once '../../components/footer/footer.php'; ?>

    <script>
        function togglePayment(method) {
            document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.method-body').forEach(el => el.style.display = 'none');
            
            document.getElementById('method-' + method).classList.add('active');
            document.getElementById('body-' + method).style.display = 'block';

            const cardInputs = document.querySelectorAll('#body-cartao input');
            if (method === 'cartao') {
                cardInputs.forEach(input => input.setAttribute('required', 'required'));
            } else {
                cardInputs.forEach(input => input.removeAttribute('required'));
            }
        }
    </script>
</body>
</html>