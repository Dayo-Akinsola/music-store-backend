const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');
const Cache = require('../cache');
const cache = new Cache(3600);
const TOKEN = process.env.TOKEN;

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

const findMatchingAlbum = async (albumId) => {
  const headers = {
    withCrendentials: true,
  }
  const popRequestUrl = `https://api.discogs.com/database/search?&format=album&style=pop&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const hipHopRequestUrl = `https://api.discogs.com/database/search?&format=album&style=hip+hop&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const jazzRequestUrl = `https://api.discogs.com/database/search?&format=album&style=jazz&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;

  const popAlbums = await cache.get(popRequestUrl, headers);
  const hipHopAlbums = await cache.get(hipHopRequestUrl, headers);
  const jazzAlbums = await cache.get(jazzRequestUrl, headers);
  const allAlbums = [].concat(popAlbums.results, hipHopAlbums.results, jazzAlbums.results);
  const matchingAlbum = allAlbums.filter(album => album.id === albumId);
  
  return matchingAlbum.length !== 0 ? matchingAlbum[0] : null;
}


module.exports = { logInUser, isUserLoggedIn, findMatchingAlbum };