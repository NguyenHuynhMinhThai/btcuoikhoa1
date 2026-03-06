import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieApi } from "../../api/movieApi";
import type { MovieDetail, ShowtimeByTheaterSystem, ShowtimeByTheaterCluster, Showtime } from "../../models/movie";

interface MovieScheduleResponse {
  heThongRapChieu: ShowtimeByTheaterSystem[];
}

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: movie,
    isLoading: movieLoading,
    error: movieError
  } = useQuery<MovieDetail>({
    queryKey: ["movie", id],
    queryFn: () => movieApi.getMovieDetail(id!).then((r) => r.data),
    enabled: !!id
  });

  const {
    data: schedule,
    isLoading: scheduleLoading,
    error: scheduleError
  } = useQuery<MovieScheduleResponse>({
    queryKey: ["schedule", id],
    queryFn: () => movieApi.getMovieSchedule(id!).then((r) => r.data),
    enabled: !!id
  });

  if (movieLoading || scheduleLoading) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <div className="loader" />
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <p>Không tìm thấy thông tin phim hoặc đã xảy ra lỗi.</p>
      </div>
    );
  }

  if (scheduleError) {
    // Không chặn toàn bộ trang, chỉ thông báo ở phần lịch chiếu
    // nên không return ở đây.
  }

  const heThongRapChieu: ShowtimeByTheaterSystem[] = schedule?.heThongRapChieu ?? [];

  return (
    <div>
      <div className="layout-two-columns">
        <div>
          <img src={movie.hinhAnh} alt={movie.tenPhim} style={{ width: "100%", maxWidth: 350, borderRadius: 8 }} />
          <h1 className="page-title mt-2">{movie.tenPhim}</h1>
          <p className="page-subtitle">{movie.moTa}</p>
        </div>
        <div className="card">
          <h3>Lịch chiếu</h3>
          {scheduleError && <p>Không tải được lịch chiếu. Vui lòng thử lại sau.</p>}
          {!scheduleError && heThongRapChieu.length === 0 && <p>Chưa có lịch chiếu</p>}
          {!scheduleError &&
            heThongRapChieu.length > 0 &&
            heThongRapChieu.flatMap((ht: ShowtimeByTheaterSystem) =>
              (ht.cumRapChieu || []).flatMap((cum: ShowtimeByTheaterCluster) =>
                (cum.lichChieuPhim || []).map((lc: Showtime) => (
                  <Link
                    key={lc.maLichChieu}
                    to={`/booking/${lc.maLichChieu}`}
                    className="tag"
                    style={{ display: "inline-block", margin: 4 }}
                  >
                    {cum.tenCumRap} - {lc.ngayChieuGioChieu}
                  </Link>
                ))
              )
            )}
        </div>
      </div>
    </div>
  );
};
