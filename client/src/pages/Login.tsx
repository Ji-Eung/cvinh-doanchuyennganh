import React, { useState } from "react";
import { useAuth } from "../auth";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (e: any) {
      setError(e.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 400 }}>
      <h3 className="mb-3">Đăng Nhập</h3>
      <form onSubmit={submit} className="vstack gap-3">
        <input
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-control"
          placeholder="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-danger small">{error}</div>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      <div className="mt-3 small">
        Chưa có tài khoản? <a href="/register">Đăng ký</a>
      </div>
    </div>
  );
};
export default Login;
