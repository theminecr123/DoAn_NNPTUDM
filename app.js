var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const hbs = require('express-handlebars');

var app = express();

// Define the range function
function range(start, end) {
    const rangeArray = [];
    for (let i = start; i <= end; i++) {
        rangeArray.push(i);
    }
    return rangeArray;
}
function ifEquals(arg1, arg2, options) {
  // Check if the two arguments are equal
  if (arg1 === arg2) {
      // Return the block content
      return options.fn(this);
  } else {
      // Return the else content if provided
      return options.inverse(this);
  }
}



// Create a Handlebars instance with the 'range' helper registered
const handlebarsInstance = hbs.create({
    helpers: {
        range: range,
        ifEquals: ifEquals,

    },
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials'
});

// Set the view engine
app.engine('hbs', handlebarsInstance.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define your routes here
var indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/DoAn_NNPTUDM")
    .then(() => {
        console.log("connected");
    })
    .catch((err) => {
        console.log(err.message);
    });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling
app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.send(err.message);
});

// Export the app module
module.exports = app;
