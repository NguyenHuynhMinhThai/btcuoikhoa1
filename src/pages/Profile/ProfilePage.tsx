import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/userApi";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile().then((r) => r.data),
    enabled: !!token
  });

  if (!token) {
    navigate("/login");
    return null;
  }
  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <div className="loader" />
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.</p>
        <button type="button" className="btn" onClick={() => navigate("/login")}>
          Đăng nhập
        </button>
      </div>
    );
  }

  const profile = data as any;
  const ve = profile?.thongTinDatVe || [];

  return (
    <div>
      <h1 className="page-title">Tài khoản</h1>
      <div className="card">
        <p><strong>Họ tên:</strong> {profile?.hoTen}</p>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Số ĐT:</strong> {profile?.soDT}</p>
      </div>
      <h2 className="mt-4">Lịch sử đặt vé</h2>
      {ve.length === 0 ? (
        <p>Chưa có vé nào</p>
      ) : (
        ve.map((v: any) => (
          <div key={v.maVe} className="card mt-2">
            <p><strong>{v.tenPhim}</strong></p>
            <p>Ngày đặt: {v.ngayDat}</p>
            <p>Tổng: {v.giaVe?.toLocaleString("vi-VN")} đ</p>
          </div>
        ))
      )}
    </div>
  );
};
