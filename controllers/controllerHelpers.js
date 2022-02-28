const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

const logInUser = async (req, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  return loggedInUser;
}

const isUserLoggedIn = (req) => {
  const token = getToken(req);
  if (token) {
    return true;
  }
  return false;
}


module.exports = { logInUser, isUserLoggedIn };