// JPMS Authentication Module
// Uses Google Identity Services (GIS) for OAuth

const Auth = (() => {
  const CLIENT_ID = window.JPMS_CLIENT_ID || localStorage.getItem('jpms_client_id') || '';
  const TOKEN_KEY = 'jpms_token';
  const USER_KEY  = 'jpms_user';

  let _token = localStorage.getItem(TOKEN_KEY);
  let _user  = null;

  try { _user = JSON.parse(localStorage.getItem(USER_KEY)); } catch(e) {}

  function getToken() { return _token; }
  function getUser()  { return _user; }
  function isLoggedIn() { return !!_token && !!_user; }

  function saveSession(token, user) {
    _token = token;
    _user  = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    _token = null;
    _user  = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function initGoogleLogin(onSuccess, onError) {
    if (!window.google) {
      onError('Google library not loaded');
      return;
    }

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        const credential = response.credential;
        // Decode JWT payload
        const parts = credential.split('.');
        const payload = JSON.parse(atob(parts[1]));

        saveSession(credential, {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          initials: getInitials(payload.name),
        });
        onSuccess(_user);
      },
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      {
        theme: 'outline',
        size: 'large',
        width: 340,
        text: 'signin_with',
        shape: 'rectangular',
      }
    );

    // Auto-prompt if not logged in
    google.accounts.id.prompt();
  }

  function logout() {
    if (window.google) {
      google.accounts.id.disableAutoSelect();
    }
    clearSession();
    window.location.hash = '#login';
    window.location.reload();
  }

  return { getToken, getUser, isLoggedIn, saveSession, clearSession, logout, initGoogleLogin, getInitials };
})();
