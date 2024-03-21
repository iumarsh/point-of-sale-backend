const express = require("express");
const { getAllTransactions, addTransaction, updateTransactionById, deleteTransactionById, getTransactionById } = require("../controller/transaction");
const router = express.Router();
router.get("/api/transaction", getAllTransactions);
router.get("/api/transaction/:id", getTransactionById)
router.post("/api/transaction", addTransaction);
router.put("/api/transaction/:id", updateTransactionById); 
router.delete("/api/transaction/:id", deleteTransactionById)


module.exports = router;