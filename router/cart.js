const express = require('express');
const router = express.Router();
const CustomerMiddleware = require("../middleware/CustomerMiddleware");
const cartController = require('../controller/cartController');


router.post('/addToCart',CustomerMiddleware, cartController.addToCart);
router.get('/cartProducts',CustomerMiddleware,cartController.getCart);

router.put('/deleteItemByID',CustomerMiddleware,cartController.deleteItemByID);
module.exports = router;
