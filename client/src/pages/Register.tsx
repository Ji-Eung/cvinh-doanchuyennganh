import React, { useState } from "react";
import { api } from "../api";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "Đăng ký thất bại");
    }
  }

  if (done)
    return (
      <div className="container py-4">
        <h3>Đăng ký thành công!</h3>
        <a href="/login">Đăng nhập</a>
      </div>
    );

  return (
    <div className="container py-4" style={{ maxWidth: 450 }}>
      <h3 className="mb-3">Đăng Ký</h3>
      <form onSubmit={submit} className="vstack gap-3">
        <input
          className="form-control"
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <button className="btn btn-success">Đăng ký</button>
      </form>
    </div>
  );
};
export default Register;
