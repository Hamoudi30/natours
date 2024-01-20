const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour name must be provided'],
      trim: true,
      minlength: [4, 'The minimum length of a tour is 4'],
      maxlength: [20, 'The maximum length of a tour is 20'],
      validate: [
        validator.isAlpha,
        'A tour name must only contain alpha characters',
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour duration must be provided'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour max group size must be provided'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour difficulty must be provided'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'the value must be easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The minimum rating of a tour is 1.0'],
      max: [5, 'The maximum duration of a tour is 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour price must be provided'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, 'A tour summary must be provided'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour image cover must be provided'],
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL PROPERTY
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// MONGOOSE MIDDLEWARE

// 1)DOCUMENT MIDDLEWARE -- .save() & .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// 2)QUERY MIDDLEWARE -- .^find()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Taken time is : ${Date.now() - this.startTime} ms`);
  // console.log(`done`);
  next();
});

// 3)AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
