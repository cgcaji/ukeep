const ORCHESTRATOR_URL = '...';  // ← única coisa hardcoded

async function boot() {
  const key = new URLSearchParams(location.search).get('k');
  
  if (!key) {
    // Pede a chave
    renderFromServer('login');  // ← back-end devolve HTML da tela de login
    return;
  }

  // Autentica
  const result = await fetch(`${ORCHESTRATOR_URL}?action=auth&k=${key}`).then(r => r.json());
  
  if (!result.success) {
    renderFromServer('login-error');
    return;
  }

  // Guarda token e renderiza a tela inicial do perfil
  sessionStorage.setItem('session_token', result.session_token);
  sessionStorage.setItem('profile', result.profile);
  renderFromServer('home');
}

async function renderFromServer(screenName, params) {
  const url = `${ORCHESTRATOR_URL}?action=render&screen=${screenName}&sessionToken=${sessionStorage.getItem('session_token')}&...`;
  const html = await fetch(url).then(r => r.text());  // ← HTML puro
  document.getElementById('app').innerHTML = html;
}

boot();