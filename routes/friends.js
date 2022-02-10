const friendsRouter = require('express').Router();
const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');
const User = require('../models/user');

friendsRouter.get('/request', async (req, res, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token);

  if (loggedInUser) {
    res.json(loggedInUser)
  }

  next();
});

friendsRouter.post('/request', async (req, res, next) => {
  const { body } = req;
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token);

  if (loggedInUser) {
    const targetUser = await User.findOne({ name: body.name, username: body.username });
    if (!targetUser) {
      return res.status(400).json({ error: 'This user does not exists'});
    }
    loggedInUser.sentRequests.push(targetUser);
    targetUser.receivedRequests.push(loggedInUser);
    await loggedInUser.save();
    await targetUser.save();
    res.json();
  }
  next();
});

module.exports = friendsRouter;
