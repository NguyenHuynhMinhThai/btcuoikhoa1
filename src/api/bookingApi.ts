import { axiosClient } from "./axiosClient";
import { DanhSachVeDat, RoomInfo } from "../models/booking";

export const bookingApi = {
  getRoomInfo(showtimeId: string | number) {
    return axiosClient.get<RoomInfo>("/api/QuanLyDatVe/LayDanhSachPhongVe", {
      params: { MaLichChieu: showtimeId }
    });
  },
  bookTickets(payload: DanhSachVeDat) {
    return axiosClient.post("/api/QuanLyDatVe/DatVe", payload);
  }
};
