// sessionConfig.js
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
};

module.exports = sessionConfig;