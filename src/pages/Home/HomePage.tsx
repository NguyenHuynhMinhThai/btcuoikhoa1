import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { movieApi } from "../../api/movieApi";
import type { Movie, MovieBanner } from "../../models/movie";

export const HomePage: React.FC = () => {
  const {
    data: banners = [],
    isLoading: bannersLoading,
    error: bannersError
  } = useQuery<MovieBanner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await movieApi.getBanners();
      return res.data;
    }
  });

  const {
    data: movies = [],
    isLoading: moviesLoading,
    error: moviesError
  } = useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: async () => {
      const res = await movieApi.getMovies();
      return res.data;
    }
  });

  if (bannersLoading || moviesLoading) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <div className="loader" />
      </div>
    );
  }

  if (bannersError || moviesError) {
    return (
      <div className="flex-center" style={{ minHeight: 300 }}>
        <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Phim đang chiếu</h1>
      <p className="page-subtitle">Chọn phim để xem lịch chiếu và đặt vé</p>
      {banners.length > 0 && (
        <div className="banner-carousel mt-3">
          <img
            src={banners[0].hinhAnh}
            alt="Banner"
            style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 8 }}
          />
        </div>
      )}
      <div className="grid-movies mt-4">
        {movies.map((movie) => (
          <Link key={movie.maPhim} to={`/movie/${movie.maPhim}`} className="movie-card">
            <img src={movie.hinhAnh} alt={movie.tenPhim} className="movie-poster" />
            <div className="movie-content">
              <div className="movie-title">{movie.tenPhim}</div>
              <div className="movie-meta">Đánh giá: {movie.danhGia}</div>
              <div className="card-actions">
                <span className="tag">{movie.dangChieu ? "Đang chiếu" : "Sắp chiếu"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
