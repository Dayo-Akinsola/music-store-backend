const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

const logInUser = async (req, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  return loggedInUser;
}

module.exports = logInUser;