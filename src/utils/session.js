const SESSION_KEY = "ncb_session_id";

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(id) {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
