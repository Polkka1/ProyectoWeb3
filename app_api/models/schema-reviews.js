const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    reviewId: { type: Number, required: true, unique: true },
    itemId: { type: Number, required: true },
    reviewerId: { type: Number, required: true },
    reviewerName: { type: String, required: true },
    sellerId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    purchaseVerified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 }, // Number of users who found this helpful
    reportedCount: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    created: { type: Date, default: Date.now }
});

//compile schema to model
const Review = mongoose.model('review', reviewsSchema);

const review = new Review({
    reviewId: 1001,
    itemId: 100001,
    reviewerId: 654321,
    reviewerName: 'John Doe',
    sellerId: 123456,
    rating: 5,
    title: 'Excellent product!',
    comment: 'Item exactly as described, fast shipping, great seller!',
    purchaseVerified: true
});

//manual saving a review with error handling
/*review.save()
  .then(() => {
    console.log('Review saved successfully:', review.title);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Review already exists with reviewId:', review.reviewId);
    } else {
      console.error('Error saving review:', err.message);
    }
  });*/