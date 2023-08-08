const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A tour  must have a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // Ref to tour
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a use'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// ONE USER CAN GIVE 1 Review on one tour
reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
  },
);

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name photo',
  //   }).populate({
  //     path: 'tour',
  //     select: 'name',
  //   });

  // as we want to get tours then reviews show not when on review tour show
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// reviewSchema.statics.calcAverageRatings = async function (tourId) {
//   const stats = await this.aggregate([
//     {
//       $match: { tour: tourId },
//     },
//     {
//       $group: {
//         _id: '$tour',
//         nRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//       },
//     },
//   ]);
//   console.log(stats);
// };

// AVERAGE RATING AND NUMBER OF RATING WHEN REVIEW ADDED AND DELETED
// static method  directly on model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log(this);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
// After review has saved then write on tour

// INCASE OF SAVE IT IS DOCUMENT MIDDLEWARE  FOR FINNDING IT IS QUERY MIDDLEWARE
// POST HAS NOT ACCESS TO NEXT function
reviewSchema.post('save', function () {
  // this .constructor points to model
  // AS WE CAN"T ACCESS MODEL BEFORE
  this.constructor.calcAverageRatings(this.tour);
  // this points to current document
  // console.log(this);
});

//  INCASE OF UPDATE AND DELETE WE USE FINDBYIDANDUPDATE/DELETE
// WE ARE USING FINDONE BEHIND THE SCENE
// THIS IS CALLED QUERY MIDDLEWARE (THIS POINTS TO QUERY) in case of pre / in post this doesnot point to query
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // console.log(this);  // this points to query

  // with this query it will find document and store in this.r and then pass to post
  this.r = await this.findOne();
  console.log('R' + this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function (req, res) {
  // await this.findOne();    this does not point to query as query is executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
