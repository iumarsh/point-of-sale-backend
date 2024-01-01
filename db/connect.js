const mongoose = require("mongoose"); 

const connectDB = async (url) => {
    try {
      await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to the database');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error; // Make sure to rethrow the error so it can be caught in the start function
    }
  };
  

module.exports = connectDB;