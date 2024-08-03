const express = require('express')
const router = express.Router();
 
const category = require('./category')
const transaction = require('./transaction')
const auth = require('./auth')




// ... import other routes as needed

router.use(category);
router.use(transaction)
router.use(auth)

module.exports = router;