import { axiosClient } from "./axiosClient";
import { Movie, MovieBanner } from "../models/movie";

export const movieApi = {
  getBanners() {
    return axiosClient.get<MovieBanner[]>("/api/QuanLyPhim/LayDanhSachBanner");
  },
  getMovies() {
    return axiosClient.get<Movie[]>("/api/QuanLyPhim/LayDanhSachPhim");
  },
  getMovieDetail(id: string | number) {
    return axiosClient.get(`/api/QuanLyPhim/LayThongTinPhim?maPhim=${id}`);
  },
  getMovieSchedule(id: string | number) {
    return axiosClient.get("/api/QuanLyRap/LayThongTinLichChieuPhim", {
      params: { MaPhim: id }
    });
  }
};
