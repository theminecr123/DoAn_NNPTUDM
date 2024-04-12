var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var categoriesModel = require('../schemas/category');

router.get('/', async function (req, res, next) {
  var categories = await categoriesModel.find({}).populate('published').exec();
  responseReturn.ResponseSend(res, true, 200, categories)
});

router.get('/:id', async function (req, res, next) {
  try {
    let categories = await categoriesModel.find({ _id: req.params.id });
    responseReturn.ResponseSend(res, true, 200, categories)
  } catch (error) {
    responseReturn.ResponseSend(res, false, 404, error)
  }
});

router.post('/', async function (req, res, next) {
  try {
    var newAuthor = new categoriesModel({
      name: req.body.name
    })
    await newAuthor.save();
    responseReturn.ResponseSend(res, true, 200, newAuthor)
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