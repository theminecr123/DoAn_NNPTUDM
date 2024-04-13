var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product');
var OrderModel = require('../schemas/order');
var OrderDetailModel = require('../schemas/orderdetail');

router.get('/', async function(req, res) {
    // Fetch cart from cookies
    const cart = req.cookies.cart || {};
    // const userId = req.user ? req.user.id : null; // Adjust as needed

    // Validate the request
    // if (!userId || Object.keys(cart).length === 0) {
    //     return res.status(400).json({ success: false, message: 'Invalid request' });
    // }

    // Fetch cart items and total price
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

    // Render the order view with cart items and total price
    res.render('order', { cart: cartItems, totalPrice: totalPrice.toFixed(2) });
});
router.post('/confirm', async function(req, res) {
    try {
        // Retrieve cart from cookies
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
            }
        }

        // Create a new order
        const newOrder = new OrderModel({
            // Uncomment and update to set the idUser if needed
            // idUser: req.user ? req.user.id : null,
            total: total,
            dateCreated: new Date(),
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
            orderId: savedOrder.idOrder,
        });
    } catch (error) {
        console.error('Error during order confirmation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.get('/success', function(req, res) {
    // Render the success page
    res.render('order_success');
});
router.get('/details/:orderId', async function(req, res) {
    const orderId = req.params.orderId;

    try {
        // Fetch order details for the given order ID
        const orderDetails = await OrderDetailModel.find({ idOrder: orderId }).populate('idProduct').lean();

        // Respond with the order details data
        res.json({
            success: true,
            orderDetails: orderDetails,
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
module.exports = router;
