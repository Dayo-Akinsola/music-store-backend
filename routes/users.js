const usersRouter = require('express').Router();
const UserControllers = require('../controllers/userControllers');

usersRouter.post('/register', (req, res, next) => UserControllers.registerUser(req, res, next));

usersRouter.post('/login', (req, res) => UserControllers.userLogin(req, res))

usersRouter.get('/details', (req, res, next) => UserControllers.getUserDetails(req, res, next));

usersRouter.put('/details', (req, res, next) => UserControllers.updateUserDetails(req, res, next));

usersRouter.get('/cart', (req, res, next) => UserControllers.getCartAlbums(req, res, next));

usersRouter.put('/cart', (req, res, next) => UserControllers.updateCart(req, res, next));

usersRouter.delete('/cart', (req, res, next) => UserControllers.deleteCartAlbum(req, res, next));

usersRouter.delete('/cart/clear', (req, res, next) => UserControllers.clearCart(req, res, next));

usersRouter.get('/user/:id', (req, res) => UserControllers.getUser(req, res));

module.exports = usersRouter;

