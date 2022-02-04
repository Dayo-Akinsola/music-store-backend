const ordersRouter = require('express').Router();
const dotenv = require('dotenv');
dotenv.config();
const Cache = require('../cache');
const cache = new Cache(3600);
const Order = require('../models/order');
const User = require('../models/user');

ordersRouter.post('/', async( req, res) => {
  const { body } = req;

  const user = User.findById(body.userId) || null;

  const order =  new Order({
    orderDate: body.orderDate,
    deliveryAddress: body.deliveryAddress,
    albums: body.albums,
    user,
  });

  const savedOrder = await order.save();
  res.json(savedOrder);

});

module.exports = ordersRouter;