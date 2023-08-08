const express = require('express');
// 3rd party middle ware
const morgan = require('morgan');

const app = express();

// Our own function modules
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

// MIDDLEWARE
// for nicely formated login
app.use(morgan('dev'));
app.use(express.json());

// // Our  own middle ware
//           Order matter alot before res.send( ) if not then not called
app.use((req, res, next) => {
  console.log('Hello from Middle Ware');
  next(); // withour next it will not move further
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/*
app.get('/api/v1/tours', getAllTours);
// Specific route
app.get('/api/v1/tours/:id', getTour);
// For Updating
app.patch('/api/v1/tours/:id', updateTour);
// DELETE
app.delete('/api/v1/tours/:id', deleteTour);
// for posting we have to use middle ware
app.post('/api/v1/tours', postTour);
*/

// Now REFACTORING
/// 3rd ROUTES
// app.route('/api/v1/tours').get(getAllTours).post(postTour);

// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// // USER Routes
// app.route('/api/v1/users').get(getAllUser).post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

/*
          Shifting to controllers to make modules

// NOW Mounting the routes
// in order to change
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(postTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// USER Routes
userRouter.route('/').get(getAllUser).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/
// Middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// creating server
// 4th SERVER
module.exports = app;
