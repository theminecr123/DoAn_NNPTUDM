const express = require('express');
const router = express.Router();
const productModel = require('../schemas/product');
require('express-async-errors');

router.get('/', async function(req, res) {
    res.render('index', { title: 'Ricie | Home' });
});

const productRouter = require('./products');
router.use('/products', productRouter);

router.get('/products', async function(req, res) {
    const products = await productModel.find({}).populate('category').lean();
    res.render('product', { title: 'Ricie | Products', products: products });
});

// Include the cart route
const cartRouter = require('./cart');
router.use('/cart', cartRouter);


const usersRouter = require('./users');
app.use('/users', usersRouter);


module.exports = router;
