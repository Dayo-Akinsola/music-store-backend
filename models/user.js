const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  id: Number,
  price: Number,
  quantity: Number,
  thumb: String,
  title: String,
});

const votedReviewSchema = new mongoose.Schema({
  vote: Boolean,
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review'}
});

const wishlistAlbumSchema = new mongoose.Schema({
  albumId: Number,
  title: String,
  thumb: String,
  price: Number,
  dataAdded: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minLength: 5, },
  name: { type: String, required: true },
  passwordHash: String,
  orders: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Order'} ],
  cart: [albumSchema],
  details: {
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    city: {type: String, default: ''},
    address: {type: String, default: ''},
    postCode: {type: String, default: ''},
    phone: {type: String, default: ''},
    email: {type: String, default: ''},
  },
  reviews: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Review'} ],
  votedReviews: [votedReviewSchema],
  wishlist: [wishlistAlbumSchema],
  friends: [ {type: mongoose.Schema.Types.ObjectId, ref: 'User'} ],
  sentRequests: [ {type: mongoose.Schema.Types.ObjectId, ref: 'User'} ],
  receivedRequests: [ {type: mongoose.Schema.Types.ObjectId, ref: 'User'} ],
});

votedReviewSchema.set('toJSON',  {
  transform: (document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;