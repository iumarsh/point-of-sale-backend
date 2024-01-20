const express = require("express"); 
const { getAllCategories, addCategory, deleteCategoryById,updateCategoryById } = require("../controller/category");
const router = express.Router();
router.get("/api/category", getAllCategories);
router.post("/api/category", addCategory);
router.put("/api/category/:id", updateCategoryById); 
router.delete("/api/category/:id", deleteCategoryById)

module.exports = router;