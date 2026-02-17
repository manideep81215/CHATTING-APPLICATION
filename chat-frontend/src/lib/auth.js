const AUTH_KEY = "chat_auth";
let memoryAuth = null;

function normalizeAuth(authData) {
  if (!authData || typeof authData !== "object") return null;
  const token = authData.token || authData.accessToken || authData.jwt || null;
  return {
    ...authData,
    token,
  };
}

function readStorage() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return raw;
  } catch {
    // ignore localStorage failures
  }
  try {
    return sessionStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value) {
  try {
    localStorage.setItem(AUTH_KEY, value);
    return true;
  } catch {
    // ignore localStorage failures
  }
  try {
    sessionStorage.setItem(AUTH_KEY, value);
    return true;
  } catch {
    return false;
  }
}

export function getAuth() {
  const raw = readStorage();
  if (!raw) return null;
  try {
    const parsed = normalizeAuth(JSON.parse(raw));
    return parsed || memoryAuth;
  } catch {
    return memoryAuth;
  }
}

export function getToken() {
  return getAuth()?.token ?? null;
}

export function setAuth(authData) {
  const normalized = normalizeAuth(authData);
  if (!normalized) return;
  memoryAuth = normalized;
  writeStorage(JSON.stringify(normalized));
}

export function clearAuth() {
  memoryAuth = null;
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore localStorage failures
  }
  try {
    sessionStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore sessionStorage failures
  }
}
