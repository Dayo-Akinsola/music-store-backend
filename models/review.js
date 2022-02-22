const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  albumId: Number,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  rating: Number,
  headline: String,
  reviewText: String,
  date: Number,
  upvotes: Number,
  downvotes: Number,
});

reviewSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;



