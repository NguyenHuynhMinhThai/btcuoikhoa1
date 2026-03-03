import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieApi } from "../../api/movieApi";

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => movieApi.getMovieDetail(id!).then((r) => r.data),
    enabled: !!id
  });
  const { data: schedule } = useQuery({
    queryKey: ["schedule", id],
    queryFn: () => movieApi.getMovieSchedule(id!).then((r) => r.data),
    enabled: !!id
  });

  if (isLoading || !movie) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <div className="loader" />
      </div>
    );
  }

  const heThongRapChieu = (schedule as any)?.heThongRapChieu || [];

  return (
    <div>
      <div className="layout-two-columns">
        <div>
          <img src={(movie as any).hinhAnh} alt="" style={{ width: "100%", maxWidth: 350, borderRadius: 8 }} />
          <h1 className="page-title mt-2">{(movie as any).tenPhim}</h1>
          <p className="page-subtitle">{(movie as any).moTa}</p>
        </div>
        <div className="card">
          <h3>Lịch chiếu</h3>
          {heThongRapChieu.length === 0 ? (
            <p>Chưa có lịch chiếu</p>
          ) : (
            heThongRapChieu.flatMap((ht: any) =>
              (ht.cumRapChieu || []).flatMap((cum: any) =>
                (cum.lichChieuPhim || []).map((lc: any) => (
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
            )
          )}
        </div>
      </div>
    </div>
  );
};
