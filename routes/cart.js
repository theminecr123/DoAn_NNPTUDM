var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product');

router.get('/', async (req, res) => {
    const cart = req.cookies.cart || {};
    const cartItems = await Promise.all(
        Object.keys(cart).map(async (itemId) => {
            const product = await productModel.findById(itemId).lean();
            return {
                id: itemId,
                name: product.name,
                image: product.thumbnail,
                price: product.price,
                quantity: cart[itemId],
            };
        })
    );

    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.json(cartItems);
    } else {
        res.render('cart', { cart: cartItems, title: 'Your Cart' });
    }
});

router.get('/get-totals', async (req, res) => {
    try {
        const cart = req.cookies.cart || {};
        let grandTotal = 0;
        const items = [];
        
        for (const itemId in cart) {
            const quantity = cart[itemId];
            const product = await productModel.findById(itemId);
            
            if (product) {
                const totalPrice = quantity * product.price;
                grandTotal += totalPrice;
                items.push({ id: itemId, totalPrice });
            }
        }
        
        res.json({ grandTotal, items });
    } catch (error) {
        console.error('Error fetching totals:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/add', (req, res) => {
    const itemId = req.body.itemId;
    const quantity = parseInt(req.body.quantity, 10) || 1;
    let cart = req.cookies.cart || {};

    if (cart[itemId]) {
        cart[itemId] += quantity;
    } else {
        cart[itemId] = quantity;
    }

    res.cookie('cart', cart);

    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.status(200).json({
            code: 200,
            result: {
                message: 'Item added to cart successfully',
                cart
            }
        });
    } else {
        res.redirect('/cart');
    }
});

router.post('/remove', (req, res) => {
    const itemId = req.body.itemId;
    let cart = req.cookies.cart || {};

    if (cart[itemId]) {
        delete cart[itemId];
        message = 'Item removed from cart successfully';
    } else {
        message = 'Item not found in cart';
    }

    res.cookie('cart', cart);

    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.status(200).json({
            code: 200,
            result: {
                message,
                cart
            }
        });
    } else {
        res.redirect('/cart');
    }
});

router.post('/update', async (req, res) => {
    const itemId = req.body.itemId;
    const quantity = parseInt(req.body.quantity, 10);
    let cart = req.cookies.cart || {};

    cart[itemId] = quantity;
    res.cookie('cart', cart);

    let grandTotal = 0;
    for (let id in cart) {
        const product = await productModel.findById(id).lean();
        grandTotal += product.price * cart[id];
    }

    res.json({ grandTotal });
});

module.exports = router;
