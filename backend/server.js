require("dotenv").config();
require("./config/passport");
const dataRoutes = require("./routes/dataRoutes");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

const sessionMiddleware = require("./config/session");
const authRoutes = require("./routes/authRoutes");

const app = express();

const mongoUrl = process.env.MONGO_URL;
const sessionSecret = process.env.SESSION_SECRET;
const PORT = process.env.PORT || 5000;

// Middleware
if (process.env.NODE_ENV === "production") {
  app.use(helmet()); // Security headers
}

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

// MongoDB Connection
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Session
app.use(express.json());
app.use(sessionMiddleware(mongoUrl, sessionSecret));
app.use(cookieParser());

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/oauth-popup-close.html", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline';"
  );
  res.sendFile(path.join(__dirname, "public", "oauth-popup-close.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Mi-CMS");
});

app.use(authRoutes);
app.use("/api", dataRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
