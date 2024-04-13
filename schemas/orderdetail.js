const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
    idOrder: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    idProduct: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    // If you removed price from order details, it should be handled differently now.
});

const OrderDetailModel = mongoose.model('OrderDetail', orderDetailSchema);

module.exports = OrderDetailModel;
