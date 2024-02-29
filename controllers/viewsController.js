const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // get data
  const tours = await Tour.find();
  // build template
  // render data
  res.status(200).render('overview', {
    tours,
  });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'tour name',
  });
};
