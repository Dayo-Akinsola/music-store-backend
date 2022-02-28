const { JsonWebTokenError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getToken = (req) => {
  const auth = req.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.substring(7);
  }
  return null;
}

const getLoggedInUser = async (token, next) => {
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      throw new JsonWebTokenError("Invalid or missing Token");  
    }
    const loggedInUser = await User.findById(decodedToken.id).populate({ path: 'sentRequests receivedRequests friends', select:'name username'});
    return loggedInUser;
  } catch(exception) {
    next(exception);
  }
}

module.exports = { getToken, getLoggedInUser };