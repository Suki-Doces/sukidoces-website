<?php
require_once __DIR__ . '/../../include/config.php';
// pages/log/login.php
session_start();
// Se já estiver logado, redireciona para o painel (ajuste se o painel estiver em outro lugar)
if (isset($_SESSION['admin_id'])) {
  header(': ./../../dashboard/painel_admin.php');
  exit;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login</title>
  <link rel="stylesheet" href="../conta/conta.css" />
  <link rel="stylesheet" href="../../style.css">
  <!-- Contoured Section >-->
  <link rel="stylesheet" href="../../components/contoured-section/contoured-section.css">
</head>

<body>
  <?php
  // HEADER COMPONENT //
  require_once '../../components/header/header.php';
  ?>
  <section class="contoured-container login-container">
    <div class="login-box" id="loginBox">
      <img src="../../assets/images/suki-doces-logo-1.svg" alt="Logo_Suki" class="logo">
      <?php
      if (!empty($_SESSION['mensagem_erro'])) {
        echo '<p class="error">' . htmlspecialchars($_SESSION['mensagem_erro']) . '</p>';
        unset($_SESSION['mensagem_erro']);
      }
      ?>
      <!-- Inputs de rádio (A Lógica) -->
      <input type="radio" id="lgn-tab1" name="login-tabs" checked>
      <input type="radio" id="lgn-tab2" name="login-tabs">

      <!-- O Switch Visual -->
      <div class="login-switch-container">
          <div class="login-slider-bg"></div> <!-- O fundo que se move -->
          <label for="lgn-tab1" class="lgn-tab-label">Entrar</label>
          <label for="lgn-tab2" class="lgn-tab-label">Cadastrar</label>
      </div>

      <!-- CONTEUDO DAS ABAS -->
      <div class="login-type">
        <div class="login-tp-page lgn-sign-in-screen">
          <form action="../conta/processa_login.php" method="post">
            <p>Email</p>
            <input class="login-input" type="email" name="email" id="login_email" placeholder="Ex. joao@email.com" required />
            <p>Senha</p>
            <input class="login-input" type="password" name="senha" id="login_pass" placeholder="Sua senha" required />
            <p>Tipo de usuário</p>
            <select class="login-select" name="role" required>
              <option class="login-select-opt" value="" disabled selected>Clique para selecionar</option>
              <option class="login-select-opt" value="user">Cliente</option>
              <option class="login-select-opt" value="admin">Administrador</option>
            </select>
            <button class="button-fill login-btn" type="submit">
              <p>Entrar</p>
            </button>
          </form>
        </div>

        <div class="login-tp-page lgn-sign-up-screen">
          <form action="../conta/processa_cadastro.php" method="post">
            <p>Nome Completo</p>
            <input class="login-input" type="text" name="username" placeholder="Ex. João da Silva" required />
            <p>Email</p>
            <input class="login-input" type="email" name="email" placeholder="Ex. joao@email.com" required />
            <p>Senha</p>
            <input class="login-input" type="password" name="senha" placeholder="Crie uma senha" required />
            <button class="button-fill login-btn" type="submit">
              <p>Cadastrar</p>
            </button>
          </form>
        </div>
      </div>
    </div>
    <!-- Login Image -->
    <div class="login-img">
    <!--Coloque aqui o aviso-->
    </div>
  </section>
  <script src="../../js/conta.js"></script>
  <?php
  // FOOTER COMPONENT //
  require_once '../../components/footer/footer.php';
  // HOVER NAV //
  require_once '../../components/hover-nav/hover-nav.php';
  ?>
</body>
</html>