const express = require('express');
const userRouter = express.Router();
const {
  getAllUser,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  deleteMe,
  updateMe,
  getMe,
  addUserMe,
  updateUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userContoller');
const authController = require('../controllers/authController');

// when user will sign up new user will be created
userRouter.post('/signup', authController.singup);

// LOGIN ALSO POST REQUEST AS DATA WILL BE GONE
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

// FORGOT PASSWORD
userRouter.post('/forgotPassword', authController.forgotPassword);
// token which will be got by email
userRouter.patch('/resetPassword/:token', authController.resetPassword);

//// AS MIDDLEWARE RUN IN SEQUENCE
// now all below it must be authenticated
userRouter.use(authController.protect);

// UPDATE
// FIRST USER MUST BE LOGIN
userRouter.patch('/updateMyPassword', authController.updatePassword);

// UpdateME
userRouter.patch('/updateMe', updateUserPhoto, resizeUserPhoto, updateMe);

// GET ME
userRouter.get('/me', addUserMe, getMe);

// DELETE
userRouter.delete('/deleteMe', deleteMe);

// BELOW ARE ONLY ADMIN CAN DO

userRouter.use(authController.restrictTo('admin'));

// USER Routes

userRouter.route('/').get(getAllUser).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
