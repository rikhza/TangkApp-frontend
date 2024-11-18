import React, { useState, useEffect } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/apiTangkApp"; // Import instance Axios
import Cookies from "js-cookie"; // Untuk menyimpan token
import { useMaterialTailwindController, setLoginStatus, setUserData, setRoleNow, setToken } from "../../context";

export function SignIn() {
  const [NIK, setNIK] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialTailwindController(); // Access context
  const { isLoggedIn } = controller;

  useEffect(() => {
    // Jika sudah login, redirect ke dashboard/home
    if (isLoggedIn) {
      navigate("/dashboard/home");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const validateToken = async () => {
      const token = Cookies.get("authToken"); // Ambil token dari cookie

      if (token && !isLoggedIn) {
        try {
          // Panggil endpoint check-token untuk validasi token
          const response = await axios.get("user/check-token");

          // Jika token valid, set context login dan data user
          setLoginStatus(dispatch, true);
          setUserData(dispatch, response.data.user);
          setRoleNow(dispatch, response.data.user.role[0]);
          setToken(dispatch, Cookies.get("authToken"));
        } catch (error) {
          console.error("Token tidak valid atau kadaluarsa:", error);
          Cookies.remove("authToken"); // Hapus token jika tidak valid
        } finally {
          setLoading(false); // Selesai loading
        }
      } else {
        setLoading(false); // Jika sudah login atau token tidak ditemukan, selesai loading
      }
    };

    validateToken();
  }, [dispatch, isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    try {
      // Kirim permintaan login ke server
      const response = await axios.post("user/login", { NIK, password });
      const { token, user } = response.data; // Ambil token dan data user dari respons

      // Simpan token ke cookie (berlaku selama 12 jam)
      Cookies.set("authToken", token, { expires: 0.5 });

      // Set login status dan user data di context
      setLoginStatus(dispatch, true);
      setUserData(dispatch, user);
      setRoleNow(dispatch, user.role[0]);
      setToken(dispatch, user.token)
      
      // Redirect ke halaman dashboard
      navigate("/dashboard/home");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error); // Tampilkan pesan error dari server
      } else {
        setError("Terjadi kesalahan, silakan coba lagi."); // Error default
      }
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Masuk
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Masuk dengan NIK dan password untuk masuk.
          </Typography>
        </div>
        <form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
          onSubmit={handleLogin}
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              NIK
            </Typography>
            <Input
              size="lg"
              placeholder="1234567890123456"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              value={NIK}
              onChange={(e) => setNIK(e.target.value)}
            />
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <Typography
              variant="small"
              color="red"
              className="mt-2 text-center font-medium"
            >
              {error}
            </Typography>
          )}
          <Button className="mt-6" fullWidth type="submit">
            Sign In
          </Button>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default SignIn;
