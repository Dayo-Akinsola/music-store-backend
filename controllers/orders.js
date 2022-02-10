const ordersRouter = require('express').Router();
const dotenv = require('dotenv');
dotenv.config();
const Order = require('../models/order');
const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

ordersRouter.post('/', async( req, res) => {
  const { body } = req;

  const order =  new Order({
    orderDate: body.orderDate,
    deliveryAddress: body.deliveryAddress,
    albums: body.albums,
  });

  const token = getToken(req);

  if (token) {
    const loggedInUser = await getLoggedInUser(token);
    order['user'] = loggedInUser._id;
    loggedInUser.orders.push(order);
    await order.save();
    await loggedInUser.save();
  } else {
    order['user'] = null;
    await order.save();
  }

  res.json();
});

module.exports = ordersRouter;