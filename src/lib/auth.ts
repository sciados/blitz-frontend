const KEY = "blitz_token";

export function setToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, token);
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEY);
}

export function clearToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
}