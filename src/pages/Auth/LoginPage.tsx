import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApi } from "../../api/userApi";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [taiKhoan, setTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await userApi.login({ taiKhoan, matKhau });
      const data = res.data as any;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userName", data.hoTen);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1 className="page-title">Đăng nhập</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Tài khoản</label>
          <input
            type="text"
            className="form-input"
            value={taiKhoan}
            onChange={(e) => setTaiKhoan(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Mật khẩu</label>
          <input
            type="password"
            className="form-input"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            required
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn">
          Đăng nhập
        </button>
      </form>
      <p className="mt-2">
        Chưa có tài khoản? <Link to="/register" style={{ color: "#22c55e" }}>Đăng ký</Link>
      </p>
    </div>
  );
};
