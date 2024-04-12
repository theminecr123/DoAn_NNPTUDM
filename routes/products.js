var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var productModel = require('../schemas/product');
var categoryModel = require('../schemas/category');

router.get('/', async function(req, res, next) {
  var queries = {};
  var arrayExclude = ["limit", "sort", "page"];
  for (const [key, value] of Object.entries(req.query)) {
      if (!arrayExclude.includes(key)) {
          queries[key] = new RegExp(value, 'i');
      }
  }
  queries.isDelete = false;

  // Fetch products and their category details
  var products = await productModel.find(queries).populate({
      path: 'category', select: 'name'
  }).lean();

  // Determine the response format based on the Accept header
  const acceptHeader = req.headers['accept'];
  if (acceptHeader && acceptHeader.includes('application/json')) {
      // Return JSON response
      res.json(products);
  } else {
      // Render the Handlebars view
      res.render('product', { title: 'Ricie | Products', products: products });
  }
});


router.get('/:id', async function (req, res, next) {
  try {
    let product = await productModel.find({ _id: req.params.id });
    responseReturn.ResponseSend(res, true, 200, product)
  } catch (error) {
    responseReturn.ResponseSend(res, false, 404, error)
  }
});

router.post('/', async function (req, res, next) {
  try {
    var newproduct = new productModel({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      quantity: req.body.quantity,
      thumbnail: req.body.thumbnail,
      description: req.body.description

    })
    await newproduct.save();
    var category = await categoryModel.findByID(req.body.category).exec();
    category.published.push(newproduct);
    await category.save();
    responseReturn.ResponseSend(res, true, 200, newproduct)
  } catch (error) {
    responseReturn.ResponseSend(res, true, 404, error)
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    let product = await productModel.findByIdAndUpdate(req.params.id, req.body,
      {
        new: true
      });
    responseReturn.ResponseSend(res, true, 200, product)
  } catch (error) {
    responseReturn.ResponseSend(res, true, 404, error)
  }
})
router.delete('/:id', async function (req, res, next) {
  try {
    let product = await productModel.findByIdAndUpdate(req.params.id, {
      isDelete: true
    }, {
      new: true
    });
    responseReturn.ResponseSend(res, true, 200, product)
  } catch (error) {
    responseReturn.ResponseSend(res, true, 404, error)
  }
})

module.exports = router;
