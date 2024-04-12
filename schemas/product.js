const mongoose = require('mongoose');
const categoryModel = require('./category'); // Require the category model

var productSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    price: Number,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories', // Ensure this matches the model name
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    quantity: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema); // Export the product model
