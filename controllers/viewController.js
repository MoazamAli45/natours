const Tour = require('../Model/tourModel');
const Book = require('../Model/bookModel');
const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// get All tours
exports.getAllTours = CatchAsync(async (req, res) => {
  // 1) GET THE TOUR DATA FROM COLLECTIOn
  const tours = await Tour.find();
  // automatically detect base

  // 2) Build the template
  // 3) Render the template
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = CatchAsync(async (req, res, next) => {
  // 1) Get the Data

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    //   which 3 fields I want
    fields: 'review rating user ',
  });
  if (!tour) {
    return next(new AppError('Tour not found!', 404));
  }
  // console.log(tour);

  // automatically detect base
  // 2) Build the template
  // 3) Render the template
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

// Login
exports.logIn = (req, res) => {
  res.status(200).render('login');
};

exports.getAccount = (req, res) => {
  res.status(200).render('account');
};

exports.signUp = (req, res) => {
  res.status(200).render('signup');
};

exports.getMyTours = async (req, res) => {
  // GEt All Bookings of users
  const bookings = await Book.find({ user: req.user.id });

  // Get All tours
  // As in Booking schema I have stored tourId with tour key
  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
};
// When Booking create show alert
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (!alert) next();
  if (alert === 'booking') res.locals.alert = 'Booking created Successfully!';
  next();
};
