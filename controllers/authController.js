const jwt = require('jsonwebtoken');

const User = require('../Model/userModel');
const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
// PROMISIFY FOR RETURN PROMISE FROM JWT VERIFY METHoD
const { promisify } = require('util');

// SENDEMAIL FROM EMAIL JS FILE USING NODEMAILER
const Email = require('../utils/email');

// JWT TOKEN
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// // Refactor for send JWT TOKEN BUT I WILL PREFER without that
const createSendToken = (user, status, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      // convert into miliseconds
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    // can't be modified
    httpOnly: true,

    // works only on https so only on production
    // secure:true
  };

  // FOR HTTPS
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // SENDING USING COOKIE
  res.cookie('jwt', token, cookieOptions);

  // so password will not show on api as it will be stored in DB
  user.password = undefined;

  res.status(status).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
};

// SIGNUP
exports.singup = CatchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  // console.log(
  //   '🚀 ~ file: authController.js:66 ~ exports.singup=CatchAsync ~ url:',
  //   url,
  // );
  new Email(newUser, url).sendWelcome();
  // id,secret,time expire
  // const token = signToken(newUser._id);

  // // user created in data base
  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     newUser,
  //   },
  // });
  // REFACTORED
  createSendToken(newUser, 201, res);
});

// LOGIN
exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  /// IF NOT EMAIL OR PASSWORD THEN
  if (!email || !password)
    return next(new AppError('Please provide email and password both', 401));

  //   The password field is excluded by default. The + symbol is used to include the field.
  // NOW CHECK USER EXIST
  const user = await User.findOne({ email }).select('+password');

  // NOW PASSWORD CHECK

  // if not user exist or password is wrong then
  // USer can access method as it is the instance method
  if (!user || !(await user.correctPassword(password, user.password))) {
    // 401 unauthorized
    return next(new AppError('Incorrect Password or Email', 401));
  }

  // if USER find then it will create the same token as in signup
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
  // REFACTORED
  createSendToken(user, 200, res);
});

// AS WE CAN"T DELETE COOKIE AND MANIPULATE AS WELL
// SO ON LOGOUT WE WILL SEND AN INVALID COOKIE

exports.logout = (req, res) => {
  const cookieOptions = {
    // will remain for 10 sec
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', 'loggedout', cookieOptions);
  res.status(200).json({
    status: 'success',
  });
};

// PROTECT ROUTES AVAILABLE ONLY ON LOGIN
exports.protect = CatchAsync(async (req, res, next) => {
  //1) CHECK IF TOKEN EXIST
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // now getting from cookies as in original web page
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged In .Please login ', 404));
  }
  // console.log(token);

  //2) VERIFY TOKEN
  // promisify will return promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // now if error comes it goes to global error middleware
  // console.log(decoded);

  // 3) NOW CHECK USER STILL EXIST
  const currentUser = await User.findById(decoded.id);
  // console.log(currentUser);
  if (!currentUser) {
    return next(new AppError("User doesn't exist.", 401));
  }
  // 4) Password change or not
  if (currentUser.changePassword(decoded.iat)) {
    return next(new AppError('User has recently changed the password', 401));
  }

  // NOW Giving access to routes
  // Now creating a user
  // WE WILL USE THIS WHEN LOGIN
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// ONly For Renndering Pages show pic if log in
exports.isLoggedIn = async (req, res, next) => {
  /// It wil not send any error

  //1) CHECK IF TOKEN EXIST
  // now getting from cookies as in original web page
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      //2) VERIFY TOKEN
      // promisify will return promise
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
      );
      // now if error comes it goes to global error middleware
      // console.log(decoded);

      // 3) NOW CHECK USER STILL EXIST
      const currentUser = await User.findById(decoded.id);
      console.log(currentUser);
      if (!currentUser) {
        return next();
      }
      // 4) Password change or not
      if (currentUser.changePassword(decoded.iat)) {
        return next();
      }

      // NOW Giving access to routes
      // Now creating a user
      // WE WILL USE THIS WHEN LOGIN

      //   SENDING DATA to frontend
      // this can be access from frontend (user)
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// AUTHORIZATION
exports.restrictTo = (...roles) => {
  // Middleware we can't pass the values so by wrapping this function
  return (req, res, next) => {
    // console.log(roles);
    //   DUE TO CLOSURE IT CAN ACCESS
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You have not permission to access.', 403)); // 403 forbidden
    }
    next();
  };
};

// FORGOT PASSWORD
exports.forgotPassword = CatchAsync(async (req, res, next) => {
  // console.log('Protocol' + req.protocol);
  // console.log('Host' + req.get('host'));

  // GET USER
  const user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) {
    return next(new AppError('No User exist with this email', 403));
  }

  // Generate Token
  // This is instance method available on all documents created in userModel file
  const resetToken = user.createTokenResetPassword();

  await user.save({ validateBeforeSave: false }); // NOW saving in database

  // SEND EMAIL
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  new Email(user, resetURL).sendResetToken();

  res.status(200).json({
    status: 'success',
    message: 'Reset Token send to email!',
  });
});
// RESET PASSWORD
exports.resetPassword = CatchAsync(async (req, res, next) => {
  // GET USER BASED ON TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // Now also find password Expires Time is greater than now means it is not expire yet
    // After 10 min if you will check as the expire time wil be less so it will be expire and not used
    passwordResetExpires: { $gt: Date.now() },
  });

  // IF NOT USER AND TOKEN NOT EXPIRED THEN ADD IN TO THE PASSWORD
  if (!user) {
    return next(new AppError('Token  is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // CHANGE Password AT property IN MIDDLEWARE

  // LOGIN
  // id,secret,time expire
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'sucess',
  //   token,
  // });
  // REFACTORED
  createSendToken(user, 200, res);
});

// UPDATE PASSWORD
exports.updatePassword = CatchAsync(async (req, res, next) => {
  // GET USER
  // to include password
  const user = await User.findById(req.user.id).select('+password');
  // CHECK PASSWORD
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Password is not correct', 401));
  }
  // UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // as when use findByIdAndUpdate middlewares will not word and validator oof confirmpassword also
  // so use save
  await user.save();

  // LOGIN AND SEND JWT
  // We can also REFACTOR BUT I WILL PREFER THIS
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'sucess',
  //   token,
  //   data: {
  //     user,
  //   },
  // });
  createSendToken(user, 200, res);
});
