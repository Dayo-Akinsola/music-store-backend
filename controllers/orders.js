const ordersRouter = require('express').Router();
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const User = require('../models/user');
const getToken = require('../helpers/serviceHelpers');

ordersRouter.post('/', async( req, res) => {
  const { body } = req;

  const order =  new Order({
    orderDate: body.orderDate,
    deliveryAddress: body.deliveryAddress,
    albums: body.albums,
  });

  const savedOrder = await order.save();

  const token = getToken(req);

  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid'});
    }
    const loggedInUser = await User.findById(decodedToken.id);
    loggedInUser.orders.push(order);
    await loggedInUser.save();
  }

  res.json(savedOrder);
});

module.exports = ordersRouter;