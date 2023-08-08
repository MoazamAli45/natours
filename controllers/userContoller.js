// User Model
const User = require('../Model/userModel');
const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Multer for image upload
const multer = require('multer');

// sharp  resizing images
const sharp = require('sharp');

const factory = require('./handlerFactory');

// multer Storage
/*const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // error free callback just like next()in express
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]; // image/jpeg
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});*/
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

// key will be photo
exports.updateUserPhoto = upload.single('photo');

// Resizing Photo
exports.resizeUserPhoto = CatchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req);
  if (!req.file) next();
  // console.log(req.file);
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // if file then resize using sharp
  // console.log('🚀 ~ file: userContoller.js:55 ~ filename:', req.file.filename);
  // then resizing images
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// filter Object for updateME function
// {..obj} using rest operator covert into array
const filterObj = function (body, ...allowedFields) {
  const newObj = {};

  Object.keys(body).forEach((el) => {
    if (allowedFields.includes(el)) {
      // if include body k whole element in newObj
      newObj[el] = body[el];
      // console.log(newObj);
    }
  });
  return newObj;
};

///////////////////////////Project
// exports.getAllUser = CatchAsync(async (req, res) => {
//   const users = await User.find();
//   // console.log(tours, '+ Tours');
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getAllUser = factory.getAll(User);

// User can be created only by signup
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Not Yet Defined',
//   });
// };

exports.deleteUser = factory.deleteOne(User);

// GET ME
exports.addUserMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getMe = factory.getOne(User);

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.updateMe = CatchAsync(async (req, res, next) => {
  // console.log(req.body);
  // if password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for update password', 403));
  }

  //filter the object only can update name and email
  //user can't update

  const filteredObj = filterObj(req.body, 'email', 'name');
  // console.log(filteredObj);
  // Update Document
  // storing Photo in DB
  if (req.file) {
    filteredObj.photo = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  // response

  res.status(200).json({
    status: ' success',
    data: {
      user,
    },
  });
});
