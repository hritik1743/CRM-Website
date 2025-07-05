const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/user"); // Adjust path as needed

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Defensive checks for missing profile fields
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : undefined;
        const photo =
          profile.photos && profile.photos[0]
            ? profile.photos[0].value
            : undefined;
        const firstName =
          profile.name && profile.name.givenName
            ? profile.name.givenName
            : undefined;
        const lastName =
          profile.name && profile.name.familyName
            ? profile.name.familyName
            : undefined;
        const displayName = profile.displayName || undefined;
        const provider = profile.provider || "google";

        // Check if user exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user if not found
        const newUser = await User.create({
          googleId: profile.id,
          displayName,
          firstName,
          lastName,
          email,
          photo,
          provider,
        });

        return done(null, newUser);
      } catch (err) {
        if (process.env.NODE_ENV === "production") {
          // Log error in production (could be replaced with a logging service)
          console.error("Passport GoogleStrategy error:", err);
        }
        return done(err, null);
      }
    }
  )
);

// Serialize user by MongoDB _id
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user by _id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
