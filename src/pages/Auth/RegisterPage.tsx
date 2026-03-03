import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userApi } from "../../api/userApi";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    taiKhoan: "",
    matKhau: "",
    email: "",
    soDt: "",
    maNhom: "GP01",
    hoTen: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await userApi.register(form);
      alert("Đăng ký thành công. Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1 className="page-title">Đăng ký</h1>
      <form onSubmit={handleSubmit}>
        {(["taiKhoan", "matKhau", "email", "soDt", "hoTen"] as const).map((k) => (
          <div key={k} className="form-field">
            <label className="form-label">
              {k === "taiKhoan" ? "Tài khoản" : k === "matKhau" ? "Mật khẩu" : k === "email" ? "Email" : k === "soDt" ? "Số điện thoại" : "Họ tên"}
            </label>
            <input
              type={k === "matKhau" ? "password" : k === "email" ? "email" : "text"}
              className="form-input"
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              required
            />
          </div>
        ))}
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn">
          Đăng ký
        </button>
      </form>
      <p className="mt-2">
        Đã có tài khoản? <Link to="/login" style={{ color: "#22c55e" }}>Đăng nhập</Link>
      </p>
    </div>
  );
};
