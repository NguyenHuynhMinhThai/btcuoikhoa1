export interface SeatEntity {
  maGhe: number;
  tenGhe: string;
  maRap: string;
  loaiGhe: "Thuong" | "Vip";
  stt: string;
  giaVe: number;
  daDat: boolean;
  taiKhoanNguoiDat?: string;
}

export interface RoomShowtimeEntity {
  maLichChieu: number;
  maRap: string;
  tenRap: string;
  tenCumRap: string;
  tenHeThongRap: string;
  diaChi: string;
  tenPhim: string;
  hinhAnh: string;
  ngayChieu: string;
  gioChieu: string;
  giaVeMacDinh: number;
}

export const showtimes: RoomShowtimeEntity[] = [
  {
    maLichChieu: 101,
    maRap: "RAP1",
    tenRap: "Rạp 1",
    tenCumRap: "CGV Vincom",
    tenHeThongRap: "CGV",
    diaChi: "Vincom Quận 1",
    tenPhim: "Avengers: Endgame",
    hinhAnh: "https://picsum.photos/300/450?movie=1",
    ngayChieu: "2026-03-01",
    gioChieu: "19:30",
    giaVeMacDinh: 90000
  }
];

export const generateSeats = (showtimeId: number): SeatEntity[] => {
  const base = showtimes.find((s) => s.maLichChieu === showtimeId);
  if (!base) {
    return [];
  }
  const seats: SeatEntity[] = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 1; col <= 10; col += 1) {
      const index = row * 10 + col;
      seats.push({
        maGhe: index,
        tenGhe: `G${index}`,
        maRap: base.maRap,
        loaiGhe: index > 60 ? "Vip" : "Thuong",
        stt: String(index),
        giaVe: index > 60 ? base.giaVeMacDinh + 20000 : base.giaVeMacDinh,
        daDat: false
      });
    }
  }
  return seats;
};

