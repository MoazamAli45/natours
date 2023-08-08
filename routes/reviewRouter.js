const express = require('express');
// FOR NESTED ROUTES
////tours/:tourId/reviews
const reviewRouter = express.Router({
  mergeParams: true,
});

const {
  getAllReviews,
  createReview,
  deleteReview,
  setTourUserIds,
  updateReview,
  getReview,
} = require('../controllers/reviewController');

const authController = require('../controllers/authController');

// NOW FOR POST    WORK FOR BOTH
// /reviews
// /tours/:tourId/reviews

// ALl must be authenticated
reviewRouter.use(authController.protect);

reviewRouter.route('/').get(getAllReviews).post(
  authController.restrictTo('user'),
  //for adding tour id
  setTourUserIds,
  createReview,
);
// /reviews/:id
reviewRouter
  .route('/:id')
  .get(getReview)
  .patch(authController.restrictTo('user', 'admin'), updateReview)
  .delete(authController.restrictTo('user', 'admin'), deleteReview);

module.exports = reviewRouter;
