var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product');
var OrderModel = require('../schemas/order');
var OrderDetailModel = require('../schemas/orderdetail');

router.get('/', async function(req, res) {
    // Fetch cart from cookies
    const cart = req.cookies.cart || {};

    // Calculate the total price and cart items
    let totalPrice = 0;
    const cartItems = await Promise.all(
        Object.keys(cart).map(async (itemId) => {
            const product = await productModel.findById(itemId).lean();
            const quantity = cart[itemId];
            totalPrice += quantity * product.price;
            return {
                id: itemId,
                name: product.name,
                price: product.price,
                quantity: quantity,
            };
        })
    );
    
    // Check the Accept header and respond with appropriate data
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.json({
            success: true,
            cartItems: cartItems,
            totalPrice: totalPrice.toFixed(2)
        });
    } else {
        res.render('checkout/order', { cart: cartItems, totalPrice: totalPrice.toFixed(2) });
    }
});

router.post('/confirm', async function(req, res) {
    const userId = req.cookies.userId;
    try {
        // Retrieve cart and userId from cookies
        const cart = req.cookies.cart || {};
        

        // Calculate the total amount
        let total = 0;
        const orderDetails = [];
        for (const itemId in cart) {
            const quantity = cart[itemId];
            const product = await productModel.findById(itemId);
            if (product) {
                total += quantity * product.price;
                orderDetails.push({
                    idProduct: itemId,
                    quantity: quantity,
                });
                // Reduce the quantity of the product in the database
                product.quantity -= quantity;
                await product.save(); // Save the updated product
            }
        }

        // Create a new order with the userId
        const newOrder = new OrderModel({
            total: total,
            dateCreated: new Date(),
            idUser: userId, // Add userId to the new order
        });
        const savedOrder = await newOrder.save();

        // Create order details
        for (const detail of orderDetails) {
            // Set the idOrder for each order detail
            detail.idOrder = savedOrder._id;
            const newOrderDetail = new OrderDetailModel(detail);
            await newOrderDetail.save();
        }

        // Clear the cart cookie after successful checkout
        res.clearCookie('cart');

        // Respond with the created order ID and success status
        res.json({
            success: true,
            orderId: savedOrder._id,
        });

    } catch (error) {
        console.error('Error during order confirmation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




router.get('/success', function(req, res) {
    // Render the success page
    res.render('checkout/order_success');
});

router.get('/details/:orderId', async function(req, res) {
    const orderId = req.params.orderId;

    try {
        // Fetch order details for the given order ID
        const orderDetails = await OrderDetailModel.find({ idOrder: orderId }).populate('idProduct').lean();
        
        // Check the Accept header and respond with appropriate data
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({
                success: true,
                orderDetails: orderDetails,
            });
        } else {
            res.render('checkout/order_details', { orderDetails });
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/history', async function(req, res) {
    // Get userId from the cookie
    const userId = req.cookies.userId;

    // If userId is not found, redirect to the login page or show an error message
    if (!userId) {
        res.redirect('/users/login');
        return;
    }

    try {
        // Find all orders for the current user
        const userOrders = await OrderModel.find({ idUser: userId }).lean();

        // Render the order history template with the user's orders
        res.render('checkout/order_history', { orders: userOrders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
