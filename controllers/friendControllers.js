const User = require('../models/user');
const logInUser = require('./controllerHelper');

const FriendControllers = (() => {

  const _duplicateRequestFound = (loggedInUser, id) => {
    const { sentRequests, receivedRequests, friends } = loggedInUser;

    const duplicateFound = (userList) => {
      const filteredUserlist  = userList.filter((user) => user._id.toString() === id);
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
  
  const getUserList = async (req, res, list) => {
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      res.json(loggedInUser[list])
    }
  }

  const sendFriendRequest = async (req, res) => {
    const loggedInUser = await logInUser(req);
    const { body } = req;
    
    if (loggedInUser) {
      const targetUser = await User.findById(body.id);
      if (_duplicateRequestFound(loggedInUser, body.id)) {
        return res.status(400).json({ error: 'You have already sent, received or are friends with this user.'})
      }

      loggedInUser.sentRequests.push(targetUser);
      targetUser.receivedRequests.push(loggedInUser);
      await loggedInUser.save();
      await targetUser.save();
      res.json({message: `Your request to ${body.name} been sent.`});
    }
  }

  const respondToFriendRequest = async (req, res) => {
    const loggedInUser = await logInUser(req);
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
      if (body.accept) {
        res.status(200).json({ message: `You are now friends with ${sender.name}.`});
      } else {
        res.status(200).json({ message: `Friend request has been declined.`})
      }
    }
  }

  const getAllUnconnectedUsers = async (req, res) => {
    const loggedInUser = await logInUser(req);
    const users = await User.find({});
    const filteredUsers = users.filter(user => !_duplicateRequestFound(loggedInUser, user._id.toString()));
    const relevantUserDetails = filteredUsers.map(user => {
      const details = {
        name: user.name,
        id: user._id,
      }
      return details;
    });
    res.json(relevantUserDetails);
  }

  return {
    getUserList,
    sendFriendRequest,
    respondToFriendRequest,
    getAllUnconnectedUsers,
  }
})();

module.exports = FriendControllers;