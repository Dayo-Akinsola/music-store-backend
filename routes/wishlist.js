const wishlistRouter = require('express').Router();
const User = require('../models/user');
const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

wishlistRouter.get('/', async (req, res, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  if (loggedInUser) {
    res.json(loggedInUser.wishlist);
  } 
  next();
}); 

wishlistRouter.post('/', async (req, res, next) => {
  const { body } = req;
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);

  if (loggedInUser) {
    const dupeAlbumCheck = loggedInUser.wishlist.filter(albumId => albumId === body.albumId);
    if (dupeAlbumCheck.length !== 0){
      return res.status(400).json({error: `${body.title} is already in your wishlist.`});
    }
    loggedInUser.wishlist.push(body);
    await loggedInUser.save();
    res.json(loggedInUser.wishlist);
  }
  next();
});

wishlistRouter.delete('/', async (req, res, next) => {
  const { body } = req
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  if (loggedInUser) {
    loggedInUser.wishlist.forEach((album, index) => {
      if (album.albumId === body.albumId) {
        loggedInUser.wishlist.splice(index, 1);
      }
    });
    await loggedInUser.save();
    res.json(loggedInUser.wishlist)
  }
  next();
});

module.exports = wishlistRouter;