const ordersRouter = require('express').Router();
const OrderControllers = require('../controllers/orderControllers');

ordersRouter.post('/', (req, res, next) => OrderControllers.addOrder(req, res, next));

ordersRouter.get('/', (req, res, next) => OrderControllers.getOrders(req, res, next));

ordersRouter.get('/:orderTime', (req, res) => OrderControllers.getOrder(req, res));

ordersRouter.put('/thumb', (req, res, next) => OrderControllers.replaceOrderAlbumThumb(req, res, next));

module.exports = ordersRouter;