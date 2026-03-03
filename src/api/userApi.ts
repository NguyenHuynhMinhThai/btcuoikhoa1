import { axiosClient } from "./axiosClient";
import { NguoiDungVM, ThongTinDangNhapVM, ThongTinTaiKhoanResponse } from "../models/user";

export const userApi = {
  login(payload: ThongTinDangNhapVM) {
    return axiosClient.post<NguoiDungVM>("/api/QuanLyNguoiDung/DangNhap", payload);
  },
  register(payload: NguoiDungVM) {
    return axiosClient.post("/api/QuanLyNguoiDung/DangKy", payload);
  },
  getProfile() {
    return axiosClient.post<ThongTinTaiKhoanResponse>("/api/QuanLyNguoiDung/ThongTinTaiKhoan");
  }
};
