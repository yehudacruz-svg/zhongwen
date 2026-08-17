// if u are reading this, go away

const LOGIN_MAP = {
  'yehuda': { password: 'yehuda007', destination: 'admin1.html' },
  'teacher': { password: 'teacher123', destination: 'admin2.html' }
};

function init() {
  const form = document.getElementById('login-form');
  const userInput = document.getElementById('login-username');
  const passInput = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = userInput.value.trim();
    const password = passInput.value;
    const entry = LOGIN_MAP[username];

    if (entry && entry.password === password) {
      errorEl.textContent = '';
      window.location.href = entry.destination;
    } else {
      errorEl.textContent = 'Incorrect username or password.';
      passInput.value = '';
      passInput.focus();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
//YC