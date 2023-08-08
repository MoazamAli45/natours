// No need to read from file
// const fs = require('fs');

// Tour Model connected to database
const Tour = require('../Model/tourModel');

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

// 2nd Route Handlers
exports.getAllTours = async (req, res) => {
  //   console.log(JSON.parse(tours));
  // console.log(req.requestTime);
  // res.status(200).json({
  //   status: 'success',
  //   requested: req.requestTime,
  //   // results: tours.length,
  //   // data: {
  //   //   tours: tours,
  //   // },
  // });

  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid Document',
    });
  }
};

exports.getTour = async (req, res) => {
  // console.log(req.params);
  const { id } = req.params;
  // in js if we multiply a string with number it also convert into number

  // const tour = tours.find((el) => el.id === +id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour: tour,
  //   },
  // });
  try {
    const tour = await Tour.findById(id);
    // console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated document
      runValidators: true, // check type to be updated with
    });
    // console.log(tour);

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Could not update',
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;

  /* const newTours = tours.filter((tour) => tour.id !== +id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(newTours),
    (err) => {
      console.log('Successfully Deleted');
      // 201 for creation
      res.status(204).json({
        status: 'success',
        data: null,
      });
    },
  );*/

  try {
    await Tour.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      message: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.postTour = async (req, res) => {
  // creating id
  /*  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);
  // adding a tour in array
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      console.log('Written into file');
      // 201 for creation
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );*/

  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
