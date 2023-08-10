const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
// For when resq come compression is used to compress it
const compression = require('compression');
// so that everyone can access api
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');
const bookingController = require('./controllers/bookingController');

// Start express app
const app = express();

// Cross Origin Resource Sharing
// so  that all can access api
app.use(cors());

// for non-simple request put,patch and delete options is called we also allowing all to access
app.options('*', cors());

// PUG template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  // Showing incoming request
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// For Stripe after Checkout complete
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// FOR FORM DATA  new FORM DATA  when you are passing directly form data using action
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// to parse cookie
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// other wise $new   special characters can login
app.use(mongoSanitize());

// COntent sercurity policy as it does not add on client side
app.use(
  helmet.contentSecurityPolicy({
    // useDefaults: true, // Keep existing headers and append CSP
    directives: {
      // Add your existing directives here
      // Example: "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js https://api.mapbox.com"
      'script-src': [
        "'self'",

        'https://api.mapbox.com',
        // 'https://js.stripe.com/v3',
        'https://js.stripe.com',
      ],
      'default-src': [
        "'self'",
        'https://api.mapbox.com',
        'https://js.stripe.com',
      ],
    },
  }),
);

// Data sanitization against XSS
// html sanitization
app.use(xss());

//   compress for production request and responses
app.use(compression());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //   console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Other routes that are not defined
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// al the errors will be caught when next(Error ) is called
app.use(globalErrorHandler);

module.exports = app;
