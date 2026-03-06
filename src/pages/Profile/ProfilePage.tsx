import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/userApi";
import type { ThongTinTaiKhoanResponse, ThongTinDatVeTaiKhoan } from "../../models/user";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const {
    data,
    isLoading,
    error
  } = useQuery<ThongTinTaiKhoanResponse>({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile().then((r) => r.data),
    enabled: !!token
  });

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <div className="loader" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <p>Phiên đăng nhập hết hạn hoặc đã xảy ra lỗi. Vui lòng đăng nhập lại.</p>
        <button type="button" className="btn" onClick={() => navigate("/login")}>
          Đăng nhập
        </button>
      </div>
    );
  }

  const profile = data;
  const ve: ThongTinDatVeTaiKhoan[] = profile.thongTinDatVe || [];

  return (
    <div>
      <h1 className="page-title">Tài khoản</h1>
      <div className="card">
        <p>
          <strong>Họ tên:</strong> {profile.hoTen}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Số ĐT:</strong> {profile.soDT}
        </p>
      </div>
      <h2 className="mt-4">Lịch sử đặt vé</h2>
      {ve.length === 0 ? (
        <p>Chưa có vé nào</p>
      ) : (
        ve.map((v) => (
          <div key={v.maVe} className="card mt-2">
            <p>
              <strong>{v.tenPhim}</strong>
            </p>
            <p>Ngày đặt: {v.ngayDat}</p>
            <p>Tổng: {v.giaVe.toLocaleString("vi-VN")} đ</p>
          </div>
        ))
      )}
    </div>
  );
};
