const AUTH_KEY = "chat_auth";

export function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return getAuth()?.token ?? null;
}

export function setAuth(authData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

