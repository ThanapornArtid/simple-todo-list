import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "@/services/tokenService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import bg2 from "@/assets/bg2.png";
import logo from "@/assets/logo.png";

interface LoginResponse {
  email: string;
  access_token: string;
  userId: number;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const loginUrl = "http://203.159.93.114:3100/auth/login";

    try {
      const response = await axios.post<LoginResponse>(loginUrl, {
        email,
        password,
      });

      const token = response.data.access_token;
      const userId = response.data.userId;
      if (token) {
        setAccessToken(token);
        if (userId) localStorage.setItem("UserID", String(userId));
        console.log("Access token stored successfully");
        navigate("/quotation"); 
      } else {
        setError("No access token received");
      }
    } catch (err: any) {
      console.error("Auth error:", err.message);
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div>
      {/* Banner section */}
      <div className="relative w-full h-60 opacity-90">
        <img
          src={bg2}
          alt="banner"
          className="absolute w-full h-full object-cover brightness-50"
        />
        <header className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl font-bold">
            Financial Management System
          </h1>
        </header>
      </div>

      {/* Login form */}
      <main className="flex flex-auto justify-center mt-5">
        <section className="w-80">
          <form onSubmit={handleLogin}>
            <img src={logo} alt="logo" className="size-16 mx-auto" />
            <h2 className="text-center text-2xl font-bold mt-2 pb-8">
              Sign in to your account
            </h2>

            {error && (
              <p className="text-red-500 text-sm text-center mb-3">{error}</p>
            )}

            <div className="flex-col relative grow">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md "
                />
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=" w-full rounded-md"
              />
            </div>

            <div className="pt-5">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign in
              </Button>
            </div>
          </form>

          <p className="pt-7 text-gray-400 text-xs text-center">
            Not a member?{" "}
            <a href="#" className="text-blue-600">
              Start a 14 day free trial
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
