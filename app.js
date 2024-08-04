const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const routes = require("./routes/index.js");
const connectDB = require("./db/connect");
const jwt = require('jsonwebtoken');
 

require("dotenv").config();
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the request path is login or register
  if (req.path === '/api/login' || req.path === '/api/register') {
    return next(); // Skip token verification
  }

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  // Verify the token (assuming JWT for this example)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }

    req.user = user; // Attach the user to the request object
    next();
  });
};

app.use(verify);
app.use(routes);
const port = process.env.PORT || 5000;

const CONNECTION_URL = process.env.CONNECTION_URL

const start = async () => {
  try {
    await connectDB(CONNECTION_URL);
    app.listen(port, console.log("SERVER is running"));
  } catch (error) {
    console.log("error: ", error);
  }
};
start();