const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user name must be provided'],
    // trim: true,
    // minlength: [4, 'The minimum length of an user name is 4'],
    // maxlength: [20, 'The maximum length of an user name is 20'],
    // validate: [validator.isAlpha, 'User name must be a valid alpha'],
  },
  email: {
    type: String,
    required: [true, 'A user email must be provided'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'User email must be a valid email'],
    // trim: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user password must be provided'],
    // minlength: [8, 'The minimum length of a user password is 8'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user confirm password must be provided'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// SCHEMA MIDDLEWARE

userSchema.pre('save', async function (next) {
  // The password field didn't change yet
  if (!this.isModified('password')) next();

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // password confirmation is not important to be saved in database (more time & space cost)
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// USER METHODS

userSchema.methods.correctPassword = function (candidatePassword, password) {
  return bcrypt.compare(candidatePassword, password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(23).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
