export interface ThongTinDangNhapVM {
  taiKhoan: string;
  matKhau: string;
}

export interface NguoiDungVM {
  taiKhoan: string;
  matKhau: string;
  email: string;
  soDt: string;
  maNhom: string;
  hoTen: string;
  maLoaiNguoiDung?: string;
}

export interface ThongTinTaiKhoanResponse {
  taiKhoan: string;
  hoTen: string;
  email: string;
  soDT: string;
  maNhom: string;
  loaiNguoiDung: string;
  thongTinDatVe: ThongTinDatVeTaiKhoan[];
}

export interface ThongTinDatVeTaiKhoan {
  maVe: number;
  tenPhim: string;
  hinhAnh: string;
  ngayDat: string;
  thoiLuongPhim: number;
  giaVe: number;
  danhSachGhe: GheDaDat[];
}

export interface GheDaDat {
  tenHeThongRap: string;
  tenCumRap: string;
  tenRap: string;
  maGhe: number;
  tenGhe: string;
}
