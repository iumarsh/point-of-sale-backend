const express = require("express");
const { getAllTransactions, addTransaction, updateTransactionById, deleteTransactionById, getTransactionById, getTransactionsByContact } = require("../controller/transaction");
const router = express.Router();
router.get("/api/transaction", getAllTransactions);
router.get("/api/transaction/:id", getTransactionById)
router.post("/api/transaction", addTransaction);
router.put("/api/transaction/:id", updateTransactionById); 
router.delete("/api/transaction/:id", deleteTransactionById)
router.get("/api/transaction/contact/:contactNumber", getTransactionsByContact);

module.exports = router;