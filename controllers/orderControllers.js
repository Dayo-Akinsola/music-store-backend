const Order = require('../models/order');
const { isUserLoggedIn, logInUser, findMatchingAlbum } = require('./controllerHelpers');

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

  const replaceOrderAlbumThumb = async (req, res, next) => {
    const { albumId, orderId } = req.body;
    const loggedInUser = await logInUser(req, next);
    const loggedInUserPopulated =  await loggedInUser.populate({ path: 'orders', select: 'albums'});
    const matchingAlbum = await findMatchingAlbum(albumId);
    const userOrder = loggedInUserPopulated.orders.filter(order => order._id.toString() === orderId);
    userOrder[0].albums.forEach(album => {
      if (album.id === albumId) {
        album.thumb = matchingAlbum.thumb;
      }
    });

    const order = await Order.findById(orderId);
    order.albums.forEach(album => {
      if (album.id === albumId) {
        album.thumb = matchingAlbum.thumb;
      }
    });

    await loggedInUserPopulated.save();
    await order.save();
    res.json(matchingAlbum.thumb);
  }

  return {
    addOrder,
    getOrders,
    getOrder,
    replaceOrderAlbumThumb,
  }
})();

module.exports = OrderControllers;