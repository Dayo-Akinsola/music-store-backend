const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  id: Number, 
  price: Number,
  quantity: Number,
  thumb: String,
  title: String,
});

const orderSchema = mongoose.Schema({
  orderDate: Number, 
  deliveryAddress: String,
  deliveryPostCode: String,
  albums: [albumSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

albumSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

orderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;