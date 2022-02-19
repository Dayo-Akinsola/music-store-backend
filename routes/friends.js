const friendsRouter = require('express').Router();
const FriendControllers = require('../controllers/friendControllers');

friendsRouter.get('/friendlist', (req, res) => FriendControllers.getUserList(req, res, 'friends'));

friendsRouter.get('/request/sent', (req, res) => FriendControllers.getUserList(req, res, 'sentRequests'));

friendsRouter.get('/request/received', (req, res) => FriendControllers.getUserList(req, res, 'receivedRequests'));

friendsRouter.post('/request', (req, res) =>  FriendControllers.sendFriendRequest(req, res));

friendsRouter.post('/request/response', (req, res) => FriendControllers.respondToFriendRequest(req, res));

friendsRouter.get('/all', (req, res) => FriendControllers.getAllUnconnectedUsers(req, res));

module.exports = friendsRouter;
