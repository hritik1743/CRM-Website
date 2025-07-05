import React from "react";

const Tabs = ({ onChange, activeTab }) => {
  // Handles switching between "Login" and "Register" tabs
  const handleTabChange = (tab) => {
    onChange(tab); // Call the parent function with the selected tab
  };

  return (
    <ul
      className="nav nav-pills nav-fill gap-2 p-1 small bg-primary rounded-5 shadow-sm mb-3"
      id="pillNav2"
      role="tablist"
      style={{
        "--bs-nav-link-color": "var(--bs-white)",
        "--bs-nav-pills-link-active-color": "var(--bs-primary)",
        "--bs-nav-pills-link-active-bg": "var(--bs-white)",
      }}
    >
      <li className="nav-item" role="presentation">
        <button
          className={`nav-link rounded-5 ${
            activeTab === "login" ? "active" : ""
          }`}
          id="home-tab2"
          data-bs-toggle="tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "login"}
          onClick={() => handleTabChange("login")}
        >
          Login
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button
          className={`nav-link rounded-5 ${
            activeTab === "register" ? "active" : ""
          }`}
          id="profile-tab2"
          data-bs-toggle="tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "register"}
          onClick={() => handleTabChange("register")}
        >
          Register
        </button>
      </li>
    </ul>
  );
};

export default Tabs;
