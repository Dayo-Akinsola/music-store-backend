const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  id: Number,
  price: Number,
  quantity: Number,
  thumb: String,
  title: String,
});

const votedReviewsSchema = new mongoose.Schema({
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review'},
  vote: Boolean,
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
  votedReviews: [votedReviewsSchema],
});


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