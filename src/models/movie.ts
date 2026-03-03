export interface MovieBanner {
  maPhim: number;
  hinhAnh: string;
}

export interface Movie {
  maPhim: number;
  tenPhim: string;
  trailer: string;
  hinhAnh: string;
  moTa: string;
  maNhom: string;
  ngayKhoiChieu: string;
  danhGia: number;
  hot?: boolean;
  dangChieu?: boolean;
  sapChieu?: boolean;
}

export interface MovieDetail extends Movie {
  lichChieu: ShowtimeByTheaterSystem[];
}

export interface ShowtimeByTheaterSystem {
  maHeThongRap: string;
  tenHeThongRap: string;
  logo: string;
  cumRapChieu: ShowtimeByTheaterCluster[];
}

export interface ShowtimeByTheaterCluster {
  maCumRap: string;
  tenCumRap: string;
  diaChi: string;
  lichChieuPhim: Showtime[];
}

export interface Showtime {
  maLichChieu: number;
  maRap: string;
  tenRap: string;
  ngayChieuGioChieu: string;
  giaVe: number;
}
