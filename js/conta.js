const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const loginBox = document.getElementById('loginBox');
const welcomeBox = document.getElementById('welcomeBox');
const userEmailSpan = document.getElementById('userEmail');
const userRoleSpan = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');

function showWelcome(user) {
  loginBox.style.display = 'none';
  welcomeBox.style.display = 'block';
  userEmailSpan.textContent = user.email;
  userRoleSpan.textContent = user.role === 'admin' ? 'Administrador' : 'Usuário';
}

function showLogin() {
  loginBox.style.display = 'block';
  welcomeBox.style.display = 'none';
  errorMsg.textContent = '';
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedUser');
  showLogin();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorMsg.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;

  if (!email || !password || !role) {
    errorMsg.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('loggedUser', JSON.stringify(data.user));
      showWelcome(data.user);
    } else {
      errorMsg.textContent = data.message || 'Credenciais inválidas.';
    }
  } catch (error) {
    errorMsg.textContent = 'Erro na conexão com o servidor.';
  }
});

// Persistência do login após reload da página
window.addEventListener('load', () => {
  const savedUser = JSON.parse(localStorage.getItem('loggedUser'));
  if (savedUser) {
    showWelcome(savedUser);
  } else {
    showLogin();
  }
});