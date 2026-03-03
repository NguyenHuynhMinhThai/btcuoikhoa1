import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <Link to="/" className="logo">
          Movie<span>TS</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          {accessToken && (
            <NavLink to="/profile" className="nav-link">
              Tài khoản
            </NavLink>
          )}
        </nav>
        <div className="auth-section">
          {accessToken ? (
            <>
              <span className="welcome-text">Xin chào, {userName}</span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn" onClick={() => navigate("/login")}>
                Đăng nhập
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/register")}>
                Đăng ký
              </button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">© {new Date().getFullYear()} Movie Booking TS</footer>
    </div>
  );
};
