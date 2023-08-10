// No need to read from file
// const fs = require('fs');

// Tour Model connected to database

const Tour = require('../Model/tourModel');
const APIFeatures = require('../utils/apiFeatures');

const AppError = require('../utils/appError');
/*               Catch Async Function in order to get rid of try catch But keep in mind I will make only function
to call so that if you want to use try catch then not confuse  */

const CatchAsync = require('../utils/catchAsync');

// Multer for image upload
const multer = require('multer');

// sharp  resizing images
const sharp = require('sharp');
// Factory handler refactored for creating deleting and updating
const factory = require('./handlerFactory');

//   1st method to store in database
// const testTour = new Tour({
//   name: 'The River Adventure',
//   rating: 4.8,
// });

// // saving Document
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log('ERROR :' + err));

//////////////// Reading File synchronously as we out of event loop
// converting into array
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

/*
               Now MongoDb will handle as this is for file 
// FOR Middle Ware Param check
// as param middle ware so 4th is id
exports.checkID = (req, res, next, id) => {
  // validation in middleware
  console.log(`tour id is ${id}`);
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid',
    });
  }
  next();
};
*/
/////////////////////NOW MONGODB SCHEMA WILL CHECK
// Middle ware for posting
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'This does not contain name or price',
//     });
//   }
//   next();
// };

// as this is middle ware so it can also contain next
exports.getCheapTours = (req, res, next) => {
  // PREDEFINED ALIASES
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name,duration,price,ratingsAverage';

  next();
};

// 2nd Route Handlers

// exports.getAllTours = async (req, res) => {
//   try {
//     /*                   REFACTORFING INFORM OF CLASSES
//     console.log(req.query);
//     // FOR ALL IT WORKS FINE
//     // const tours = await Tour.find();

//                            //  1A)    FILTERING
//     let queryObject = { ...req.query };
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     // this will delete all the fields from query object
//     excludedFields.forEach((el) => delete queryObject[el]);
//     // console.log(req.query, queryObject);

//                                // 1B) ADVANCE FILTERING
//     // In  MongoDB we use $ sign for operators
//     // {difficulty: 'easy', duration: {$gte: 5}}

//     // {difficulty: 'easy', duration: {gte: '5'}}
//     // \b exact match
//     let queryString = JSON.stringify(queryObject);
//     queryString = queryString.replace(
//       /\b(gte|gt|lte|lt)\b/g,
//       (match) => `$${match}`,
//     );

//     console.log(JSON.parse(queryString));

//     let query = Tour.find(JSON.parse(queryString));

//                                     //  2) SORTING
//     if (req.query.sort) {
//       // IF Same come then
//       const sortBy = req.query.sort.split(',').join(' ');
//       console.log(sortBy);

//       query = query.sort(sortBy);
//     } else {
//       query = query.sort('createdAt');
//     }
//                          // 3) Limiting Not including all the fields

//     if (req.query.fields) {
//       const field = req.query.fields.split(',').join(' ');
//       // including those fields   select('name duration')
//       query = query.select(field);
//     } else {
//       query = query.select('-__v');
//     }

//                               // 4) Pagination
//     // by multiplying with 1 string would be converted into number and OR is used to set by default value 1
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 20;
//     const skip = (page - 1) * 10;
//     query = query.skip(skip).limit(limit);
//     if (req.query.page) {
//       const count = await Tour.countDocuments();
//       // if skip become greater than total result will be zero then it will throw error
//       if (skip >= count) throw new Error('This page does not exist');
//     }
// */

//     console.log(req.query);
//     // Making Object of APIFEATURES CLASS
//     const apiFeatures = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     // console.log(apiFeatures);
//     // AS MONGOOS WILL CHAIN METHODS SO WE CAN USE THIS
//     const tours = await apiFeatures.query;
//     // console.log(tours, '+ Tours');
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours: tours,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'fail',
//       message: error,
//     });
//   }
// };

/////////////AFTER REFACTORING WITHOUT TRY CATCH

// exports.getAllTours = CatchAsync(async (req, res) => {
//   const apiFeatures = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   // console.log(apiFeatures);
//   // AS MONGOOS WILL CHAIN METHODS SO WE CAN USE THIS
//   const tours = await apiFeatures.query;
//   // console.log(tours, '+ Tours');
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

exports.getAllTours = factory.getAll(Tour);

// exports.getTour = CatchAsync(async (req, res, next) => {
//   //  /:id
//   // console.log(req.params);
//   const { id } = req.params;
//   // in js if we multiply a string with number it also convert into number

//   // const tour = tours.find((el) => el.id === +id);

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour: tour,
//   //   },
//   // });

//   // Now we are virtually populating reviews
//   const tour = await Tour.findById(id).populate('reviews');
//   // if id is same like but not match then it return tour null so we have to handle it
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   // console.log(tour);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });
// POPULATING REVIEWS WITH THE HELP OF ViRTUALS AS PARENT REFERENCING IS USED
exports.getTour = factory.getOne(Tour, 'reviews');

// exports.updateTour = CatchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, // return updated document
//     runValidators: true, // check type to be updated with
//   });
//   // console.log(tour);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });
// due to resize I am storing in memory
const multerStorage = multer.memoryStorage();

// multer Filter
const multerFilter = (req, file, cb) => {
  // only upload images
  if (file.mimetype.startsWith('image')) {
    // error free
    cb(null, true);
  } else {
    // Error
    cb(new AppError('Please Upload only Images', 404), false);
  }
};

// Options for uploading
const upload = multer({
  storage: multerStorage,
  filter: multerFilter,
});

exports.uploadTourPhoto = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

exports.resizeTourPhoto = CatchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) next();

  // coming from req.files
  // adding on req.body as we are saving req.body to save
  req.body.imageCover = `tour-${req.user._id}-${Date.now()}-cover.jpeg`;
  // console.log(req.files);
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // Now other 3 images
  // wait for all promises to solve
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async function (el, i) {
      req.body.images[i] = `tour-${req.user._id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(req.files.images[i].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.images[i]}`);
    }),
  );

  next();
});

exports.updateTour = factory.updateOne(Tour);
//    NOW I have refactored in factory handler function
// exports.deleteTour = CatchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   /* const newTours = tours.filter((tour) => tour.id !== +id);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(newTours),
//     (err) => {
//       console.log('Successfully Deleted');
//       // 201 for creation
//       res.status(204).json({
//         status: 'success',
//         data: null,
//       });
//     },
//   );*/

//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     message: null,
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

// CALLING CATCH ASYNC IN ORDER TO GET RID OF TRY CATCH BLOCK
// IT ALSO RETURN A FUNCTION   IN ORDER TO CALL IT WE HAVE TO CALL IT

// exports.postTour = CatchAsync(async (req, res, next) => {
//   // creating id
//   /*  const newId = tours[tours.length - 1].id + 1;

//   const newTour = Object.assign({ id: newId }, req.body);
//   // adding a tour in array
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       console.log('Written into file');
//       // 201 for creation
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     },
//   );*/

//   /*try {
//     const tour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }*/

//   // NOW WITHOUT TRY CATCH YOU CAN ALSO MAKE OTHER FUNCTION BUT THAT WILL CONFUSE ME NEXT TIME SO NO NEED FOR NOW
//   const tour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.postTour = factory.createOne(Tour);

// AGGREGATION PIPELINES
exports.getStats = async (req, res) => {
  // Array of stages
  // Data pass from each stage
  try {
    const stats = await Tour.aggregate([
      {
        // just like filtering
        $match: { ratingsAverage: { $gte: 4.5 } },
      },

      {
        // for Average
        $group: {
          // _id:'null'
          // _id: '$ratingsAverage',
          // You can also Upper case
          _id: { $toUpper: '$difficulty' }, // stats on the basis of that object value
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          ratingQuantity: { $sum: '$ratingsQuantity' },
          numTours: { $sum: 1 }, // as 1 tour in each document
        },
      },
    ]);
    res.status(201).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  // console.log(req.params);
  const year = req.params.year;
  try {
    const plan = await Tour.aggregate([
      {
        // take values from array and make document for each
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            // found between that
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        // $month in mongodb givesmotnh num
        $group: {
          _id: { $month: '$startDates' },
          // analyzes by month and taking tour of month in each document and add 1
          // number of tours in that month
          numTour: { $sum: 1 },
          // now push the tour names in array that happen in that month
          tour: { $push: '$name' },
        },
      },
      {
        //  adding field of months
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          // 0 means not to show
          _id: 0,
        },
      },
      {
        $sort: {
          numTour: -1,
        },
      },
    ]);
    // console.log(plan);

    res.status(201).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// miles
// /tours-within/400/center/34.029216, -118.256022/unit/mi
exports.getToursWithin = CatchAsync(async (req, res, next) => {
  // DESTRUCTING FORM PARAMS
  const { distance, latlng, unit } = req.params;

  // radius means into radians
  // divide by radius of earth in miles or km
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // Now destructing from Array
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new AppError('Please give a required format in lat,lng', 400));
  }

  // console.log('latlng',lat,lng,"distance",distance)

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = CatchAsync(async (req, res, next) => {
  // DESTRUCTING FORM PARAMS
  const { latlng, unit } = req.params;

  // Now destructing from Array
  const [lat, lng] = latlng.split(',');

  // meters to miles and kilometers
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please give a required format in lat,lng', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance', // store in this distance(key) of object
        distanceMultiplier: multiplier, // this will automatically convert into miles and km
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
