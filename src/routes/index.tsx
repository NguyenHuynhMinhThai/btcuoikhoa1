import React from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "../pages/Home/HomePage";
import { MovieDetailPage } from "../pages/MovieDetail/MovieDetailPage";
import { BookingPage } from "../pages/Booking/BookingPage";
import { LoginPage } from "../pages/Auth/LoginPage";
import { RegisterPage } from "../pages/Auth/RegisterPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movie/:id" element={<MovieDetailPage />} />
      <Route path="/booking/:showtimeId" element={<BookingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
};
