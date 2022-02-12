const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');
const User = require('../models/user');

const FriendControllers = (() => {

  const _logInUser = async (req) => {
    const token = getToken(req);
    const loggedInUser = await getLoggedInUser(token);
    return loggedInUser;
  }

  const _requestToSelfCheck = (loggedInUser, body) => {
    if (loggedInUser.name !== body.name || loggedInUser.username !== body.username) {
      return false;
    }
    return true;
  }

  const _duplicateRequestFound = (loggedInUser, body) => {
    const { sentRequests, receivedRequests, friends } = loggedInUser;

    const duplicateFound = (userList) => {
      const filteredUserlist  = userList.filter((user) => user.name === body.name && user.username === body.username);
      if (filteredUserlist.length === 0) {
        return false;
      }
      return true;
    }

    if (duplicateFound(sentRequests) || duplicateFound(receivedRequests) || duplicateFound(friends)) {
      return true;
    }
    return false;
  }
  
  const getUserList = async (req, res, next, list) => {
    const loggedInUser = await _logInUser(req);

    if (loggedInUser) {
      res.json(loggedInUser[list])
    }
    next();
  }

  const sendFriendRequest = async (req, res, next) => {
    const loggedInUser = await _logInUser(req);
    const { body } = req;
  
    if (loggedInUser) {
      if (_requestToSelfCheck(loggedInUser, body)) {
        return res.status(400).json({ error: 'You cannot send a request to yourself.'});
      }

      const targetUser = await User.findOne({ name: body.name, username: body.username });
      if (!targetUser) {
        return res.status(400).json({ error: 'This user does not exists'});
      }

      if (_duplicateRequestFound(loggedInUser, body)) {
        return res.status(400).json({ errror: 'You have already sent, received or are friends with this user.'})
      }
      loggedInUser.sentRequests.push(targetUser);
      targetUser.receivedRequests.push(loggedInUser);
      await loggedInUser.save();
      await targetUser.save();
      res.json();
    }
    next();
  }

  const respondToFriendRequest = async (req, res, next) => {
    const loggedInUser = await _logInUser(req);
    const { body } = req;

    if (loggedInUser) {
      const receiver = await User.findOne({ name: loggedInUser.name, username: loggedInUser.username})
        .populate({ path: 'sentRequests receivedRequests friends', select:'name username'});
      const sender = await User.findOne({ name: body.name, username: body.username})
        .populate({ path: 'sentRequests receivedRequests friends', select:'name username'});
      const { receivedRequests, friends } = receiver;

      if (body.accept) {
        friends.push(sender);
        sender.friends.push(receiver);
      }

      receivedRequests.forEach((request, index) => {
        if (request._id.toString() === sender._id.toString()) {
          receivedRequests.splice(index, 1);
        }
      });

      sender.sentRequests.forEach((request, index) => {
        if (request._id.toString() === receiver._id.toString()) {
          sender.sentRequests.splice(index, 1);
        }
      });

      await receiver.save();
      await sender.save();
      res.status(200).json({ message: `You are now friends with ${sender.name}`});
    }
    next();
  }

  const getFriendsWishlist = async (req, res, next) => {

  }

  return {
    getUserList,
    sendFriendRequest,
    respondToFriendRequest,
  }
})();

module.exports = FriendControllers;