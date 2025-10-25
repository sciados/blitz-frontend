import axios from "axios";
import { getToken, clearToken } from "./auth";

// const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const baseURL = "https://blitz-backend-production.up.railway.app";

export const api = axios.create({
    baseURL,
    withCredentials: false
});

api.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            clearToken();
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);