const mongoose = require('mongoose');
// Validator 3rd party Package for validation
const validator = require('validator');

// ENCRYPTION
const bcrypt = require('bcryptjs');

// Crypto for creating reset token
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  passwordChangedAt: {
    type: Date,
  },
  name: {
    type: String,
    required: [true, 'Please provide user name. '],
  },
  email: {
    type: String,
    required: [true, 'Please provide user email'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: 'String',
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    // not shown at all
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide  confirm password'],
    validate: {
      validator: function (el) {
        // this will work only on save and creating

        return el === this.password;
      },
      message: 'Password does not match ',
    },
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // when user delete himself it will not delete from database but will eb unactive and not show in api
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Query Middleware
userSchema.pre(/^find/, function (next) {
  // it means not false it can be not property of active will also show
  // as in start I have not defined active property but you can also use active true
  this.find({ active: { $ne: false } });
  next();
});

///  CHANGEPASSWORDAT  PROPERTY WHEN PASSWORD RESET
userSchema.pre('save', function (next) {
  // if new document or not modified then next

  if (!this.isModified || this.isNew) return next();

  // if password reset then

  // as password Changed At wil happen first and JWT will be created later so
  // in order to JWT Created Later so -1s
  this.passwordChangedAt = Date.now() - 1000;
  // console.log(this.passwordChangedAt);
  next();
});

// Before saving adn creating we want to encrypt the password
// NOT ARROW FUNCTION AS I WILL USE THIS KEYWORD

userSchema.pre('save', async function (next) {
  //  IN START WHEN WE CREATE NEW IT WILL ALSO MODIFIED SO IN START IT IS CHANGED
  // RUN ONLY IF THIS IS ACTUALLY MODIFIED
  if (!this.isModified('password')) {
    // If the 'password' field has not been modified, the code logs 'CHECK 💥' and immediately calls the next() function, skipping the rest of the hook.
    console.log('CHECK 💥');
    return next();
  }
  // console.log(this.password);

  // CPU WILL HASH WITH 12 INTENSE
  this.password = await bcrypt.hash(this.password, 12);

  // PASSWORD CONFIRM NOT NEED TO STORE ONLY FOR NOT USER TO WRITE WRONG PASSWAORD

  this.passwordConfirm = undefined;

  next();
});

// METHOD IS ACCESS TO EVERY DOCUMENT
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // candidatePassword is entered as not in Hashed form
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changePassword = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // in order to convert ms into s divide by 1000
    // Parse int to convert into integer
    const changeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(changeTime);
    // console.log('JWT', JWTTimeStamp);

    // if 200<300 then it password is changed
    // As token will be created one time so it means JWT time will be less than
    return JWTTimeStamp < changeTime;
  }

  // if not change
  return false;
};

userSchema.methods.createTokenResetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Token stored in DB in hashed form
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // in 10min it wil expire
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // console.log(resetToken, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
