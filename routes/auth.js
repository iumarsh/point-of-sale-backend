const express = require("express"); 
const { login, register } = require("../controller/auth");
const router = express.Router();
router.post("/api/login", login);
router.post("/api/register", register);

module.exports = router;