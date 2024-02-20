const express = require('express');
const reviewsController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewsController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewsController.setTourUserIds,
    reviewsController.createReview,
  );

router
  .route('/:id')
  .get(reviewsController.getReview)
  .patch(reviewsController.updateReview)
  .delete(reviewsController.deleteReview);

module.exports = router;
