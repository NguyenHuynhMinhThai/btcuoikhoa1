export interface UserEntity {
  taiKhoan: string;
  matKhau: string;
  email: string;
  soDt: string;
  maNhom: string;
  hoTen: string;
  maLoaiNguoiDung: "KhachHang" | "QuanTri";
}

export const users: UserEntity[] = [
  {
    taiKhoan: "admin",
    matKhau: "123456",
    email: "admin@example.com",
    soDt: "0123456789",
    maNhom: "GP01",
    hoTen: "Quản Trị",
    maLoaiNguoiDung: "QuanTri"
  }
];

