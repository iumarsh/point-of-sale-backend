const mongoose = require("mongoose"); 

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  categoryType: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
  },
  additionalInfo: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    trim: true
  }

}, {timestamps: true});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;