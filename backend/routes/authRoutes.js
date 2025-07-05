const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    let success = true;
    if (err || !user) {
      success = false;
    }
    if (!success) {
      req.logIn = (u, cb) => cb && cb(); // no-op if not logged in
    }
    req.logIn(user, (err) => {
      // Redirect to static HTML file with success/failure as query param
      return res.redirect(`/oauth-popup-close.html?success=${!err && success}`);
    });
  })(req, res, next);
});

router.get("/api/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

router.get("/api/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isLoggedIn: true, user: req.user });
  } else {
    res.json({ isLoggedIn: false });
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) console.log(err);
      // Clear the correct session cookie name based on environment
      const cookieName =
        process.env.NODE_ENV === "production" ? "sid" : "connect.sid";
      res.clearCookie(cookieName, {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      });
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

module.exports = router;
