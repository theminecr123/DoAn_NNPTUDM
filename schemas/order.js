const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the order schema
const orderSchema = new Schema({
    idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who placed the order
    total: { type: Number, required: true }, // Total order amount
    dateCreated: { type: Date, default: Date.now }, // Order creation date
});

// Create the Order model
const Order = mongoose.model('order', orderSchema);

// Export the Order model
module.exports = Order;
