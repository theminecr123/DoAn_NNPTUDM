const express = require('express');
const router = express.Router();
const productModel = require('../schemas/product');
require('express-async-errors');

router.get('/', async function(req, res) {
    res.render('index', { title: 'Ricie | Home' });
});

const productRouter = require('./products');
router.use('/products', productRouter);

const categoryRouter = require('./category');
router.use('/category', categoryRouter);

// Include the cart route
const cartRouter = require('./cart');
router.use('/cart', cartRouter);

const orderRouter = require('./order');
router.use('/order', orderRouter);

module.exports = router;
