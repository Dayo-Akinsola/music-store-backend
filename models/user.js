const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, minLength: 5, },
  name: { type: String, required: true },
  passwordHash: String,
  orders: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Order'} ],
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