const Review = require('../Model/reviewModel');
const CatchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = CatchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.getAllReviews = factory.getAll(Review);

// middleware to add tour an user Id and then create
exports.setTourUserIds = (req, res, next) => {
  // you can also define user and tour explicitly as well by tours
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user;

  next();
};

// exports.createReview = CatchAsync(async (req, res, next) => {
//   // you can also define user and tour explicitly as well by tours
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user;

//   const review = await Review.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });

// Before  this middleware will run
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
