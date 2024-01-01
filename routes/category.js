const express = require("express"); 
const { getAllCategories, addCategory, deleteCategoryById } = require("../controller/category");
const router = express.Router();
router.get("/api/category", getAllCategories);
router.post("/api/category", addCategory);
router.delete("/api/category/:id", deleteCategoryById)

module.exports = router;