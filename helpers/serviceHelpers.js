const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getToken = (req) => {
  const auth = req.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.substring(7);
  }
  return null
}

const getLoggedInUser = async (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid or missing'});
  }
  const loggedInUser = await User.findById(decodedToken.id);
  return loggedInUser;
}

module.exports = { getToken, getLoggedInUser };