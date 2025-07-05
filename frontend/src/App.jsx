import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import NavbarComponent from "../components/Navbar";
import Home from "../pages/Home";
import Login from "../components/Login";
import toast, { Toaster } from "react-hot-toast";
import API from "./api";
import Dashboard from "../pages/Dashboard";
import CampaignLog from "../pages/CampaignLog";
import SaaSFooter from "../components/Footer";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [oauthLoading, setOauthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/auth/status")
      .then((res) => setIsLoggedIn(res.data.isLoggedIn))
      .catch((err) => console.log("Auth check error:", err));

    const handleMessage = (event) => {
      const allowedOrigin = new URL(API.defaults.baseURL).origin;
      if (event.origin !== allowedOrigin) return;
      console.log("Received postMessage:", event);
      console.log(
        "allowedOrigin:",
        allowedOrigin,
        "event.origin:",
        event.origin
      );

      if (event.data.success) {
        setOauthLoading(true);
        // Immediately check session status from backend after OAuth
        API.get("/api/auth/status")
          .then((res) => {
            if (res.data.isLoggedIn) {
              toast.success("OAuth login successful");
              setIsLoggedIn(true);
              // Force a full page reload to guarantee all UI updates
              window.location.reload();
            } else {
              toast.error("Session not established. Please try again.");
            }
          })
          .catch(() => {
            toast.error("Session check failed. Please try again.");
          })
          .finally(() => setOauthLoading(false));
      } else {
        toast.error("OAuth login failed");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, setIsLoggedIn]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#007BFF",
            fontWeight: "bold",
            border: "1px solid #0056b3",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        }}
      />
      <NavbarComponent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:logId" element={<CampaignLog />} />
      </Routes>
      {oauthLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center"
          style={{ zIndex: 2000 }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Logging in...</span>
          </div>
          <span className="ms-3 fw-bold text-primary">
            Logging in with Google...
          </span>
        </div>
      )}
      <SaaSFooter />
    </>
  );
}

export default App;
