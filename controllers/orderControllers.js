const Order = require('../models/order');
const { isUserLoggedIn, logInUser } = require('./controllerHelpers');

const OrderControllers = (() => {

  const addOrder = async (req, res, next) => {
    const { body } = req;
  
    const order =  new Order({
      orderDate: body.orderDate,
      deliveryAddress: body.deliveryAddress,
      deliveryPostCode: body.deliveryPostCode,
      albums: body.albums,
    });

    if (!isUserLoggedIn(req)) {
      order['user'] = null;
      await order.save();
    } else {
      const loggedInUser = await logInUser(req, next);
      if (loggedInUser) {
        order['user'] = loggedInUser._id;
        loggedInUser.orders.push(order);
        await order.save();
        await loggedInUser.save();
      } 
    }

    res.end();
  }

  const getOrders = async (req, res, next) => {

    const loggedInUser = await logInUser(req, next);
    
    if (loggedInUser) {
      await loggedInUser.populate({ path: 'orders' });
      const { orders } = loggedInUser;
      res.json(orders);
    }
  }

  const getOrder = async (req, res) => {
    const { orderTime } = req.params;
    const order = await Order.findOne({ orderDate: orderTime});
    res.json(order);
  }

  return {
    addOrder,
    getOrders,
    getOrder,
  }
})();

module.exports = OrderControllers;