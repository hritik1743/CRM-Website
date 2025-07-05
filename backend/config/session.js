const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = (mongoUrl, sessionSecret) => {
  const isProduction = process.env.NODE_ENV === "production";
  return session({
    name: isProduction ? "sid" : undefined,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      httpOnly: true, 
    },
    proxy: isProduction, 
  });
};
