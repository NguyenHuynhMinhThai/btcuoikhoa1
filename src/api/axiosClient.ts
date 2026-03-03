import axios from "axios";

const apiPort = import.meta.env.VITE_API_PORT || 4000;
export const axiosClient = axios.create({
  baseURL: `http://localhost:${apiPort}`,
  headers: {
    "Content-Type": "application/json"
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});
