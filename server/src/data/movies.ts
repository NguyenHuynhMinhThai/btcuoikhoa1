export interface MovieEntity {
  maPhim: number;
  tenPhim: string;
  trailer: string;
  hinhAnh: string;
  moTa: string;
  maNhom: string;
  ngayKhoiChieu: string;
  danhGia: number;
  hot: boolean;
  dangChieu: boolean;
  sapChieu: boolean;
}

export const movies: MovieEntity[] = [
  {
    maPhim: 1,
    tenPhim: "Avengers: Endgame",
    trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    hinhAnh: "https://picsum.photos/300/450?movie=1",
    moTa: "Siêu anh hùng Marvel chống lại Thanos.",
    maNhom: "GP01",
    ngayKhoiChieu: "2019-04-26",
    danhGia: 9,
    hot: true,
    dangChieu: true,
    sapChieu: false
  },
  {
    maPhim: 2,
    tenPhim: "Inception",
    trailer: "https://www.youtube.com/watch?v=8hP9D6kZseM",
    hinhAnh: "https://picsum.photos/300/450?movie=2",
    moTa: "Kiến trúc sư giấc mơ và phi vụ đánh cắp ý tưởng.",
    maNhom: "GP01",
    ngayKhoiChieu: "2010-07-16",
    danhGia: 8.8,
    hot: true,
    dangChieu: false,
    sapChieu: false
  }
];

export const banners = movies.slice(0, 3).map((movie) => ({
  maPhim: movie.maPhim,
  hinhAnh: movie.hinhAnh
}));

