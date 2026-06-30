const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const routes = require("./routes/index.js");
const connectDB = require("./db/connect");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(async (req, res, next) => {
  try {
    await connectDB(process.env.CONNECTION_URL);
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

const verify = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  if (req.path === "/api/login" || req.path === "/api/register") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  });
};

app.use(verify);
app.use(routes);

module.exports = app;

const port = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(port, () => console.log("SERVER is running"));
}
