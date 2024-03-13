const express = require("express"); 
const { getAllTransactions, addTransaction, deleteTransactionById, getTransactionById } = require("../controller/transaction");
const router = express.Router();
router.get("/api/transaction", getAllTransactions);
router.get("/api/transaction/:id", getTransactionById)
router.post("/api/transaction", addTransaction);
router.delete("/api/transaction/:id", deleteTransactionById)


module.exports = router;