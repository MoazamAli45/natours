const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');
const bookingController = require('../controllers/bookingController');
// router.get('/', (req, res) => {
//   // automatically detect base
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//   });
// });

// isLoggedIn
// you can access if user login then show pic on nav

router.get(
  '/',
  //     This is only in development mode we can only create original booking after deployment through stripe payment
  // but in this way we are creating
  bookingController.createCheckoutBooking,
  authController.isLoggedIn,
  viewController.getAllTours,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// Login Page
router.get('/login', authController.isLoggedIn, viewController.logIn);
router.get('/signup', viewController.signUp);

// get Account
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
module.exports = router;
