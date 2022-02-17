const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

const logInUser = async (req) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token);
  return loggedInUser;
}

module.exports = logInUser;