import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../../api/bookingApi";
import type { RoomInfo, SeatInfo } from "../../models/booking";

export const BookingPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Map<number, number>>(new Map());

  const {
    data,
    isLoading,
    error
  } = useQuery<RoomInfo>({
    queryKey: ["room", showtimeId],
    queryFn: () => bookingApi.getRoomInfo(showtimeId!).then((r) => r.data),
    enabled: !!showtimeId
  });

  const bookMutation = useMutation({
    mutationFn: (payload: { maLichChieu: number; danhSachVe: { maGhe: number; giaVe: number }[] }) =>
      bookingApi.bookTickets(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", showtimeId] });
      setSelected(new Map());
      alert("Đặt vé thành công");
      navigate("/profile");
    },
    onError: (err: any) => alert(err.response?.data?.message || "Lỗi đặt vé")
  });

  const toggleSeat = (s: SeatInfo) => {
    if (s.daDat) return;
    const next = new Map(selected);
    if (next.has(s.maGhe)) next.delete(s.maGhe);
    else next.set(s.maGhe, s.giaVe);
    setSelected(next);
  };

  const total = Array.from(selected.values()).reduce((a, b) => a + b, 0);
  const danhSachVe = Array.from(selected.entries()).map(([maGhe, giaVe]) => ({ maGhe, giaVe }));

  const handleBook = () => {
    if (!showtimeId || danhSachVe.length === 0) {
      alert("Vui lòng chọn ghế");
      return;
    }
    if (!localStorage.getItem("accessToken")) {
      alert("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    bookMutation.mutate({
      maLichChieu: Number(showtimeId),
      danhSachVe
    });
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <div className="loader" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <p>Không tải được thông tin phòng vé. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const phim = data.thongTinPhim;
  const seats = data.danhSachGhe as SeatInfo[];

  return (
    <div>
      <h1 className="page-title">Chọn ghế - {phim?.tenPhim}</h1>
      <p className="page-subtitle">
        {phim?.tenCumRap} - {phim?.tenRap} | {phim?.ngayChieu} {phim?.gioChieu}
      </p>
      <div className="seats-grid">
        {seats.map((s) => (
          <button
            key={s.maGhe}
            type="button"
            className={`seat ${selected.has(s.maGhe) ? "selected" : ""} ${s.daDat ? "booked" : ""}`}
            onClick={() => toggleSeat(s)}
            disabled={s.daDat}
          >
            {s.tenGhe}
          </button>
        ))}
      </div>
      <div className="card mt-3">
        <div>Tổng tiền: {total.toLocaleString("vi-VN")} đ</div>
        <button
          type="button"
          className="btn mt-2"
          onClick={handleBook}
          disabled={bookMutation.isPending || danhSachVe.length === 0}
        >
          {bookMutation.isPending ? "Đang xử lý..." : "Đặt vé"}
        </button>
      </div>
    </div>
  );
};
