const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
///  Schema for giving default values and validation
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, ' A tour must contain name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name can have equal or less than 40 characters '],
      minLength: [10, 'A tour name can have equal or more than 10 characters '],
      // 3rd party validators
      // but this function also checks for space
      // validate: [validator.isAlpha, 'It only contains characters'],
    },
    //  will add in middleware
    slug: String,

    secret: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, ' A tour must contain duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // fixed words to be used
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be either easy,medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      // [boolean,error message]
      default: 4.5,
      min: [1, 'A ratings average can be equal or more than 1'],
      max: [5, 'A ratings average can be equal or less than 5'],
      // as Math.round give integer so first convert to integer and then divide
      set: (val) => Math.round(val * 10) / 10, // 4.6*10 47 47/10 4.7  else it will give 4
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // custom validator to check discount is not greater than price
      validate: {
        // return true if valid
        validator: function (val) {
          // this points to document in case of new created

          return val < this.price;
        }, // ({VALUE})  // give the value of discount
        message: 'DiscountPrice ({VALUE}) is greater than price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      // required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), // mongoose will convert it into date
    },
    startDates: [Date],
    // start Locations
    // GEOSPATIAL DATA MONGODB USE GEOJSON
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      // Embedding doucments
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    // Now Guides and tours by child referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL PROPERTIES
// Virtual properties are not store in database but it computes from documents
// You can't apply find method on it

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATION
// As we don't want to child reference for tour contain reviews so virtually connect tours wit reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // IN REVIEW SCHEMA tour
  localField: '_id',
});

/*                     MIDDLEWARE IN MONGOOSE        
4TYPES) 
 */
//                   Document Middleware
// also called pre and post save hook
//   only run on .create() and .save()

// PRE run before savng document in DB
tourSchema.pre('save', function (next) {
  // this points to document which is going to save
  // console.log(this);
  // Adding slug in it
  this.slug = slugify(this.name, {
    lower: true,
  });

  //                   MYUST DEFINE IN SCHEMA
  // console.log(this.slug);
  next();
});

// tourSchema.post('save', function (doc, next) {
//   // doc whih is saved
//   // console.log(this, doc);
//   next();
// });

//                QUERYMIDDLEWARE
// Run for Query

// run before any query that starts with find
tourSchema.pre(/^find/, function (next) {
  // IF we want to not show Secret tours

  // this points to query object
  this.find({
    secret: { $ne: true },
  });
  this.start = Date.now();
  next();
});

// Before Find I want to populate
// As I am using child referencing so tour will store ids of all guides
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// tourSchema.post(/^find/, function (doc, next) {
//   // IF we want to not show Secret tours

//   console.log(`Time taken ${Date.now() - this.start} milliseconds`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// CHECKING AS IN GEOSPATIAL AGGREGATION WE WANT TO ADD FIRST $GEONEAR AS FIRST BUT DUE TO THIS IT CAN"T SO COMMENT OUT THIS ONE
/*tourSchema.pre('aggregate', function (next) {
  // this points to aggregated object
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  // console.log('Aggregation', this.pipeline());

  next();
});
*/
////////////////////////////////////////////////
// Indexes for efficiency but index also take resources which are not more read and write
// tourSchema.index({ price: 1 }); // 1 for ascending   // SINGLE INDEX

tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 for ascending   // COMPOUND  INDEX
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// Model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
