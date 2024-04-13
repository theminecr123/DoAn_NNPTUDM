const express = require('express');
const router = express.Router();
const productModel = require('../schemas/product');
require('express-async-errors');

router.get('/', async function(req, res) {
    res.render('index', { title: 'Ricie | Home' });
});

const productRouter = require('./products');
router.use('/products', productRouter);

// Include the cart route
const cartRouter = require('./cart');
router.use('/cart', cartRouter);

module.exports = router;
