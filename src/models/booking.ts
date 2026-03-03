export interface VeVM {
  maGhe: number;
  giaVe: number;
}

export interface DanhSachVeDat {
  maLichChieu: number;
  danhSachVe: VeVM[];
}

export interface SeatInfo {
  maGhe: number;
  tenGhe: string;
  maRap: string;
  loaiGhe: string;
  stt: string;
  giaVe: number;
  daDat: boolean;
  taiKhoanNguoiDat?: string;
}

export interface RoomInfo {
  maLichChieu: number;
  thongTinPhim: {
    maLichChieu: number;
    tenCumRap: string;
    tenRap: string;
    diaChi: string;
    tenPhim: string;
    hinhAnh: string;
    ngayChieu: string;
    gioChieu: string;
  };
  danhSachGhe: SeatInfo[];
}
