const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    // if admin wants to get cash then
    type: Boolean,
    default: true,
  },
});

bookSchema.pre(/^find/, function (next) {
  //   console.log(this);
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
