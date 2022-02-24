const friendsRouter = require('express').Router();
const FriendControllers = require('../controllers/friendControllers');

friendsRouter.get('/friendlist', (req, res, next) => FriendControllers.getUserList(req, res, next, 'friends'));

friendsRouter.get('/request/sent', (req, res, next) => FriendControllers.getUserList(req, res, next, 'sentRequests'));

friendsRouter.get('/request/received', (req, res, next) => FriendControllers.getUserList(req, res, next, 'receivedRequests'));

friendsRouter.post('/request', (req, res, next) =>  FriendControllers.sendFriendRequest(req, res, next));

friendsRouter.post('/request/response', (req, res, next) => FriendControllers.respondToFriendRequest(req, res, next));

friendsRouter.get('/all', (req, res, next) => FriendControllers.getAllUnconnectedUsers(req, res, next));

module.exports = friendsRouter;
