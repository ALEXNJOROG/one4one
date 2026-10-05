const TOKEN_KEY = "one4one_admin_token";
const USER_KEY = "one4one_admin_user";

function isExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false; // not a JWT, let the backend decide
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return false;
  }
}

export function saveAuth(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
  } catch {}
}

export function loadAuth() {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isExpired(token)) {
      clearAuth();
      return { token: null, user: null };
    }
    return { token, user: JSON.parse(localStorage.getItem(USER_KEY) || "null") };
  } catch {
    return { token: null, user: null };
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}