var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product');

router.get('/', async function(req, res, next) {
    // Fetch cart from cookies
    const cart = req.cookies.cart || {};
    console.log("Cart data:", cart);

    // Fetch product details for items in the cart
    const cartItems = await Promise.all(
        Object.keys(cart).map(async (itemId) => {
            const product = await productModel.findById(itemId).lean();
            return {
                id: itemId,
                name: product.name,
                price: product.price,
                quantity: cart[itemId],
            };
        })
    );
    console.log("Cart items:", cartItems);

    // Check accept header and return appropriate response
    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.json(cartItems);
    } else {
        res.render('cart', { cart: cartItems, title: 'Your Cart' });
    }
});


router.post('/add', function(req, res) {
    const itemId = req.body.itemId;
    const quantity = parseInt(req.body.quantity, 10) || 1;

    // Retrieve the cart from cookies or create a new cart object
    let cart = req.cookies.cart || {};

    // Add the item to the cart or update the quantity
    if (cart[itemId]) {
        cart[itemId] += quantity;
    } else {
        cart[itemId] = quantity;
    }

    // Save the cart back to the cookies
    res.cookie('cart', cart);

    // Check accept header and return appropriate response
    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.status(200).json({
            code: 200,
            result: {
                message: 'Item added to cart successfully',
                cart: cart
            }
        });
    } else {
        res.redirect('/cart');
    }
});


router.post('/remove', function(req, res) {
    const itemId = req.body.itemId;

    // Retrieve the cart from cookies
    let cart = req.cookies.cart || {};

    // Remove the item from the cart
    let message;
    if (cart[itemId]) {
        delete cart[itemId];
        message = 'Item removed from cart successfully';
    } else {
        message = 'Item not found in cart';
    }

    // Save the updated cart back to the cookies
    res.cookie('cart', cart);

    // Check accept header and return appropriate response
    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        res.status(200).json({
            code: 200,
            result: {
                message: message,
                cart: cart
            }
        });
    } else {
        res.redirect('/cart');
    }
});

module.exports = router;
