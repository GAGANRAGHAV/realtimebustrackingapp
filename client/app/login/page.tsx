"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For registration
  const [role, setRole] = useState("driver"); // Default role for registration
  const [boardingLocation, setBoardingLocation] = useState(""); // For parent role

  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
  
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
  
      if (response.data.role === "admin") {
        router.push("/admin");
      } else if (response.data.role === "driver") {
        router.push("/driver");
      } else if (response.data.role === "parent") {
        localStorage.setItem("boardingLocation", response.data.boardingLocation);
        router.push("/parent");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  

  const handleRegister = async () => {
    try {
      const requestData = { name, email, password, role };
      
      if (role === "parent") {
        requestData.boardingLocation = boardingLocation;
      }
  
      const response = await axios.post("http://localhost:5000/api/auth/register", requestData);
      console.log("Registration successful:", response.data);
      setIsLogin(true); // Switch to login after successful registration
    } catch (error) {
      console.error("Registration failed", error);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="mb-6 text-2xl font-bold">
          {isLogin ? "Login" : "Register"}
        </h1>

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Name"
              className="w-full mb-4 p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="w-full mb-4 p-2 border rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
              <option value="parent">Parent</option>

              
            </select>


            {role === "parent" && (
                <input
                  type="text"
                  placeholder="Enter child's boarding location"
                  className="w-full mb-4 p-2 border rounded"
                  value={boardingLocation}
                  onChange={(e) => setBoardingLocation(e.target.value)}
                />
              )}
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isLogin ? (
          <button
            onClick={handleLogin}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleRegister}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Register
          </button>
        )}

        <p className="mt-4 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 cursor-pointer"
          >
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
}
