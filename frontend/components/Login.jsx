import { useState } from "react";
import Tabs from "../utils/Tab";
import toast from "react-hot-toast";
import API from "../src/api";

const Login = ({ setIsLoggedIn, setActiveTab, activeTab }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Please Sign in with Google.");
      setLoading(false);
      return;
    }

    toast.error("Please Sign in with Google.");
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5 mb-5">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h3 className="card-title text-center mb-4">
                {activeTab === "register" ? "Sign Up" : "Login"}
              </h3>
              <form onSubmit={handleSubmit}>
                {/* Tabs for Login/Sign Up */}
                <Tabs activeTab={activeTab} onChange={handleTabChange} />
                {/* Full Name - only shown when it's Sign Up */}
                {activeTab === "register" && (
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      
                    />
                  </div>
                )}

                {/* Email Input */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    
                  />
                </div>

                {/* Password Input */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    
                  />
                </div>

                {/* Confirm Password - only shown when it's Sign Up */}
                {activeTab === "register" && (
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      
                    />
                  </div>
                )}

                {/* Login or Sign Up Button */}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </span>
                    ) : activeTab === "register" ? (
                      "Sign Up"
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>

              {/* OAuth button */}
              <div className="d-grid gap-2 mt-3">
                <a
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                  style={{ gap: "8px" }}
                  onClick={async () => {
                    setLoading(true);
                    const width = 500;
                    const height = 600;
                    const left = (window.innerWidth - width) / 2;
                    const top = (window.innerHeight - height) / 2;

                    const authUrl = new URL(
                      "/auth/google",
                      API.defaults.baseURL
                    ).href;
                    
                    // Open popup and check if blocked
                    const popup = window.open(
                      authUrl,
                      "GoogleLogin",
                      `width=${width},height=${height},top=${top},left=${left}`
                    );
                    if (
                      !popup ||
                      popup.closed ||
                      typeof popup.closed === "undefined"
                    ) {
                      toast.error(
                        "Popup was blocked. Please allow popups and try again."
                      );
                      window.dispatchEvent(new Event("popupBlocked"));
                      setLoading(false);
                      return;
                    }

                    // Poll for login status if postMessage fails
                    const poll = setInterval(() => {
                      if (popup.closed) {
                        API.get("/api/auth/status")
                          .then((res) => {
                            if (res.data.isLoggedIn) {
                              toast.success("OAuth login successful");
                              window.location.href = "/dashboard";
                            }
                          })
                          .catch(() => {})
                          .finally(() => setLoading(false));
                        clearInterval(poll);
                      }
                    }, 1000);
                  }}
                  disabled={loading}
                >
                  {/* Google SVG Icon */}
                  {loading ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </span>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 533.5 544.3"
                      >
                        <path
                          fill="#4285f4"
                          d="M533.5 278.4c0-18.4-1.6-36-4.8-52.9H272v100.3h146.9c-6.3 34.1-25.6 62.9-54.8 82v68.3h88.5c51.8-47.8 81.9-118 81.9-197.7z"
                        />
                        <path
                          fill="#34a853"
                          d="M272 544.3c73.6 0 135.6-24.3 180.8-65.9l-88.5-68.3c-24.5 16.4-55.8 26-92.3 26-70.9 0-131-47.9-152.4-112.4h-90v70.6c45.7 90.1 139.2 149 242.4 149z"
                        />
                        <path
                          fill="#fbbc04"
                          d="M119.6 322.7c-10.5-31.4-10.5-65.5 0-96.9v-70.6h-90c-37.1 73.3-37.1 160.7 0 234l90-66.5z"
                        />
                        <path
                          fill="#ea4335"
                          d="M272 107.7c39.8 0 75.7 13.7 103.9 40.4l77.9-77.9C407.2 24.3 345.2 0 272 0 168.8 0 75.3 58.9 29.6 149l90 70.6c21.4-64.5 81.5-112.4 152.4-112.4z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </a>
              </div>

              <div className="text-center mt-3">
                <a href="/" className="text-decoration-none">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
