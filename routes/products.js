var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var productModel = require('../schemas/product');
var categoryModel = require('../schemas/category');

var multer = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/') // Specify the directory where files will be saved
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) // Create a unique filename
  }
});

var upload = multer({ storage: storage });


const productsPerPage = 10; // 2 rows * 5 products per row

router.get('/', async function(req, res, next) {
    // Query handling for filtering
    const queries = {};
    const arrayExclude = ['limit', 'sort', 'page'];

    for (const [key, value] of Object.entries(req.query)) {
        if (!arrayExclude.includes(key)) {
            queries[key] = new RegExp(value, 'i');
        }
    }
    queries.isDelete = false;

    // Pagination
    const currentPage = parseInt(req.query.page) || 1; // Current page from query parameters, default to 1
    const skip = (currentPage - 1) * productsPerPage; // Calculate the number of products to skip
    const totalProducts = await productModel.countDocuments(queries); // Total products matching the query
    const totalPages = Math.ceil(totalProducts / productsPerPage); // Calculate total number of pages

    // Retrieve products for the current page
    const products = await productModel.find(queries)
        .populate({ path: 'category', select: 'name' })
        .skip(skip)
        .limit(productsPerPage)
        .lean();

    // JSON response or render Handlebars view
    const acceptHeader = req.headers['accept'];
    if (acceptHeader && acceptHeader.includes('application/json')) {
        // Return JSON response
        res.json(products);
    } else {
        // Render the Handlebars view with products, pagination data, and title
        res.render('product', {
            title: 'Ricie | Products',
            products: products,
            currentPage: currentPage,
            totalPages: totalPages,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
            nextPage: currentPage < totalPages ? currentPage + 1 : null
        });
    }
});


router.get('/add', async function(req, res) {
  try {
      // Fetch all categories from the database
      const categories = await categoryModel.find().lean();

      // Render the 'addproduct' view with the categories data
      res.render('addproduct', { categories });
  } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
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



router.post('/', upload.single('image'), async function(req, res) {
  try {
      // Create a new product using the form data and uploaded image file
      var newProduct = new productModel({
          name: req.body.name,
          price: req.body.price,
          category: req.body.category,
          quantity: req.body.quantity,
          description: req.body.description,
          thumbnail: req.file ? req.file.path : null // Check if file is provided
      });

      console.log(newProduct.thumbnail);

      // Save the new product
      await newProduct.save();

      // Update the category with the new product
      var category = await categoryModel.findById(req.body.category);
      
      // Check if category exists
      if (!category) {
          throw new Error('Category not found');
      }

      // Ensure the 'published' array exists
      if (!category.published) {
          category.published = [];
      }

      category.published.push(newProduct);
      await category.save();

      // Check the Accept header in the request
      const acceptHeader = req.headers['accept'];

      if (acceptHeader && acceptHeader.includes('application/json')) {
          // Return JSON response
          res.json({ success: true, message: 'Product added successfully.' });
      } else {
          // Redirect the user to the /products page
          res.redirect('/products');
      }
  } catch (error) {
      console.error('Error adding new product:', error);
      if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
          // Return JSON error response
          res.status(500).json({ success: false, message: error.message });
      } else {
          // Use responseReturn to send error response in other formats (e.g., HTML)
          responseReturn.ResponseSend(res, false, 500, error.message);
      }
  }
});





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
