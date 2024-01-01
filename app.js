const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const routes = require("./routes/index.js");
const connectDB = require("./db/connect");
 

require("dotenv").config();
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

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