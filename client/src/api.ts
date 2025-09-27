import axios from "axios";

const baseURL =
  (import.meta as any).env?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const r = await api.post("/auth/refresh", { refreshToken });
          localStorage.setItem("accessToken", r.data?.data?.accessToken);
          localStorage.setItem("refreshToken", r.data?.data?.refreshToken);
          original.headers.Authorization = `Bearer ${r.data.data.accessToken}`;
          return api(original);
        } catch (_) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
