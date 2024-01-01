const mongoose = require("mongoose"); 

const TransactionSchema = new mongoose.Schema({
    items: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          quantity: {
            type: Number,
            required: true,
            trim: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
    ],
    grandTotal: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        trim: true,
    },

},{timestamps: true});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;