const express = require('express')
const router = express.Router();
 
const category = require('./category')
const transaction = require('./transaction')



// ... import other routes as needed

router.use(category);
router.use(transaction)
module.exports = router;