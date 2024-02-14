var dotenv  = require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');


const adminroutes = [
  {path: '/', routesFile: 'admin'},
  {path: '/login', routesFile: 'login'},
  {path: '/customer', routesFile: 'customer'},
  {path: '/password', routesFile: 'password'},
  {path: '/product', routesFile: 'product'},
  {path: '/category', routesFile: 'category'},
  {path : '/variant', routesFile: 'variant'}
]

const customerRoutes = [
  {path : '/login', routesFile : 'login'},
  {path : '/review', routesFile : 'review'},
  {path : '/cart', routesFile : 'cart'}
]
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('runValidators', true);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once('open',() => {
  console.log('well done ! mongodb connect successfuly');
}).on('error', (error) => {
  console.log('mongodb error',error);
})

adminroutes.forEach((item) => {
  app.use('/admin'+item.path, require('./routes/admin/'+item.routesFile));
});

customerRoutes.forEach((item) => {
  app.use('/customer'+item.path, require('./routes/customer/'+item.routesFile));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
