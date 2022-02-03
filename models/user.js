const dotenv = require('dotenv');
dotenv.config();
const dbUrl = process.env.MONGODB_URI;
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.connect(dbUrl, { useNewUrlParser: "true", useUnifiedTopology: "true"})
    .then(() => {
      console.log('connected to the user DB');
    })
    .catch((error) => {
      console.log('failed to connect to the user DB', error.message);
    })

const albumSchema = new mongoose.Schema({
  id: String, 
  cover_image: String,
  title: String,
  price: Number,
});

const orderSchema = new mongoose.Schema({
  albums: [albumSchema],
  orderDate: String,
  deliveryAddress: String,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minLength: 5,
  },
  name: { String, required: true },
  passwordHash: String,
  orders: [orderSchema],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
});

userSchema.plugin(uniqueValidator);


const User = mongoose.model('User', userSchema);

module.exports = User;