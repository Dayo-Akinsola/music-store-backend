const Order = require('../models/order');
const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

const OrderControllers = (() => {
  const _findLoggedInUser = async (req) => {
    const token = getToken(req);
    if (!token) {
      return null;
    }
    const loggedInUser = await getLoggedInUser(token);
    return loggedInUser;
  }

  const addOrder = async (req, res) => {
    const { body } = req;
  
    const order =  new Order({
      orderDate: body.orderDate,
      deliveryAddress: body.deliveryAddress,
      deliveryPostCode: body.deliveryPostCode,
      albums: body.albums,
    });
  
    const loggedInUser = await _findLoggedInUser(req);

    if (loggedInUser) {
      order['user'] = loggedInUser._id;
      loggedInUser.orders.push(order);
      await order.save();
      await loggedInUser.save();
    } else {
      order['user'] = null;
      await order.save();
    }
  
    res.json();
  }

  const getOrders = async (req, res) => {
    const loggedInUser = await _findLoggedInUser(req);
    
    if (loggedInUser) {
      await loggedInUser.populate({ path: 'orders' });
      const { orders } = loggedInUser;
      res.json(orders);
    }
  }

  return {
    addOrder,
    getOrders,
  }
})();

module.exports = OrderControllers;