const friendsRouter = require('express').Router();
const FriendControllers = require('../controllers/friendControllers');

friendsRouter.get('/request', (req, res, next) => FriendControllers.getUserFriends(req, res, next));

friendsRouter.post('/request', (req, res, next) =>  FriendControllers.sendFriendRequest(req, res, next));

module.exports = friendsRouter;
