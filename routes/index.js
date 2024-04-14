const express = require('express');
const router = express.Router();
const session = require('express-session');
const productModel = require('../schemas/product');
require('express-async-errors');

router.use(session({
    secret: 'NNPTUDM',
    resave: false,
    saveUninitialized: false
}));

router.get('/', async function(req, res) {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const user = req.session.user;
    res.render('index', { title: 'Ricie | Home', user: user });
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
router.use('/users', usersRouter);


module.exports = router;
