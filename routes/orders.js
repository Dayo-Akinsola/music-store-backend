const ordersRouter = require('express').Router();
const OrderControllers = require('../controllers/orderControllers');

ordersRouter.post('/', (req, res) => OrderControllers.addOrder(req, res));

ordersRouter.get('/', (req, res) => OrderControllers.getOrders(req, res));

module.exports = ordersRouter;