import axios from "axios";
import ENV from "../env"; // Import konfigurasi dari env.js
import Cookies from "js-cookie"; // Gunakan js-cookie untuk token

// Buat instance Axios
const axiosInstance = axios.create({
  baseURL: ENV.APITangkApp, // URL dasar untuk semua permintaan
  timeout: 10000, // Waktu tunggu default (10 detik)
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambahkan interceptor untuk menyisipkan token dari cookie
axiosInstance.interceptors.request.use(
  (config) => {
    // Ambil token dari cookie
    const token = Cookies.get("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tambahkan interceptor untuk menangani error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika token tidak valid (401), hapus token dan redirect ke login
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized, redirecting to login...");
      Cookies.remove("authToken"); // Hapus token dari cookie
      window.location.href = "/auth/sign-in"; // Redirect ke halaman login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
