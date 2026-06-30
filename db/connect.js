const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (url) => {
  if (!url) {
    throw new Error("CONNECTION_URL is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(url).then((mongooseInstance) => {
      console.log("Connected to the database");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("Error connecting to the database:", error);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
