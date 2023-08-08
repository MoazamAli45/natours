const express = require('express');
const tourRouter = express.Router();
const {
  getAllTours,
  postTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
  getCheapTours,
  getStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourPhoto,
  resizeTourPhoto,
} = require('../controllers/tourContoller');

const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRouter');

//           This is for FIle
// Params middleware for checking id
// tourRouter.param('id', checkID);

// Middleware for nested routes for reviews
tourRouter.use('/:tourId/reviews', reviewRouter);

// ALiases
tourRouter.route('/top-5-cheap').get(getCheapTours, getAllTours);

// Statistics by agregation pipeline
tourRouter.route('/tour-stats').get(getStats);

// Monthly Plan aggregation unwind
// access all exccept user
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan,
  );

// tours-within
tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// distances from location
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    postTour,
  );

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadTourPhoto,
    resizeTourPhoto,
    updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour,
  );

// for Checkout Stripe

tourRouter.get(
  '/bookings/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = tourRouter;
