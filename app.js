var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const hbs = require('express-handlebars');



var app = express();
app.engine('hbs', hbs.engine({
  extname: '.hbs',
    defaultLayout: 'main', // Set 'main' as the default layout
    layoutsDir: 'views/layouts', // Specify the layouts directory
    partialsDir: 'views/partials' // Specify the partials directory
}));
app.set('view engine', 'hbs');
app.set('views', 'views');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
//hostname:port/

mongoose.connect("mongodb://127.0.0.1:27017/DoAn_NNPTUDM")
.then(function () {
    console.log("connected");
  }
).catch(function (err) {
  console.log(err.message);
})


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message)
});

module.exports = app;
