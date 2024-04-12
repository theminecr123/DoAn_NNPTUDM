var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product');

router.get('/', async function(req, res, next) {
  try {
    // Fetch all products
    var products = await productModel.find({}).populate('category').lean();
    res.render('index', { title: 'Ecommerce', products: products });
  } catch (error) {
    // Handle error
    next(error);
  }
});

module.exports = router;
