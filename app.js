/* eslint-disable import/no-extraneous-dependencies */
// MODULES
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const usersRoute = require('./routes/usersRoute');
const toursRoute = require('./routes/toursRoute');
const reviewsRoute = require('./routes/reviewsRoute');
const viewsRoute = require('./routes/viewsRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // Block 60 minutes
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

// SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// ROUTE
app.use('/', viewsRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/tours', toursRoute);
app.use('/api/v1/reviews', reviewsRoute);

// HANDLE NOT VALID URLS IN MIDDLEWARE STACK
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`), 404);
});

// pass error controller in global error handler to app
app.use(globalErrorHandler);

module.exports = app;
