import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import {
  useMaterialTailwindController,
  setLoginStatus,
  setUserData,
  setRoleNow,
  setToken,
} from '@/context';
import axios from '@/api/apiTangkApp';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const [controller, dispatch] = useMaterialTailwindController();
  const { isLoggedIn } = controller;
  const [loading, setLoading] = useState(!isLoggedIn); // Loading state jika validasi token diperlukan
  const location = useLocation();
  useEffect(() => {
    const validateToken = async () => {
      const token = Cookies.get('authToken'); // Ambil token dari cookie

      if (token && !isLoggedIn) {
        try {
          // Panggil endpoint check-token untuk validasi token
          const response = await axios.get('user/check-token');

          // Jika token valid, set context login dan data user
          setLoginStatus(dispatch, true);
          setUserData(dispatch, response.data.user);
          setRoleNow(dispatch, response.data.user.role[0]);
          setToken(dispatch, Cookies.get('authToken'));
        } catch (error) {
          console.error('Token tidak valid atau kadaluarsa:', error);
          Cookies.remove('authToken'); // Hapus token jika tidak valid
        } finally {
          setLoading(false); // Selesai loading
        }
      } else {
        setLoading(false); // Jika sudah login atau token tidak ditemukan, selesai loading
      }
    };

    validateToken();
  }, [dispatch, isLoggedIn]);

  if (loading) {
    return <div>Loading...</div>; // Tampilan sementara saat validasi berlangsung
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/auth/sign-in?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children; // Render halaman jika sudah login
};

export default ProtectedRoute;
