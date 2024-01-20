// MODULES
const express = require('express');
const morgan = require('morgan');
const usersRoute = require('./routes/usersRoute');
const toursRoute = require('./routes/toursRoute');

// MIDDLEWARE
const app = express();
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  // console.log(`hello from the middleware`);
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTE
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/tours', toursRoute);

module.exports = app;
