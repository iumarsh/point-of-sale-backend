const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Regular'],
    default: 'Regular'
  }
}, {timestamps: true});


module.exports = mongoose.model('User', userSchema);
