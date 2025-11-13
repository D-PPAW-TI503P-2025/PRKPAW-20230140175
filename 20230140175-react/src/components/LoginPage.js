import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        email: email,
        password: password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response ? err.response.data.message : "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Efek cahaya di background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>

      <div className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-white tracking-wide">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              placeholder="masukkan email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              placeholder="masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-white text-black font-semibold rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="text-sm text-gray-400 mt-6 text-center">
          Belum punya akun?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-gray-100 hover:underline cursor-pointer"
          >
            Daftar di sini
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
