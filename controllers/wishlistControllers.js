const logInUser = require('./controllerHelper');

const WishlistControllers = (() => {

  const getUserWishlist = async (req, res) => {
    const loggedInUser = await logInUser(req);
    if (loggedInUser) {
      res.json(loggedInUser.wishlist);
    } 
  }

  const addAlbumToWishlist = async (req, res) => {
    const { body } = req;
    const loggedInUser = await logInUser(req);
  
    if (loggedInUser) {
      const dupeAlbumCheck = loggedInUser.wishlist.filter(album => album.albumId === body.albumId);
      if (dupeAlbumCheck.length !== 0){
        return res.status(400).json({error: `${body.title} is already in your wishlist.`});
      }
      loggedInUser.wishlist.push(body);
      await loggedInUser.save();
      res.end();
    }
  }

  const removeAlbumFromWishlist = async (req, res) => {
    const { body } = req
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      loggedInUser.wishlist.forEach((album, index) => {
        if (album.albumId === body.albumId) {
          loggedInUser.wishlist.splice(index, 1);
        }
      });
      await loggedInUser.save();
      res.end();
    }
  }

  const updateWishlistAlbumComment = async (req, res) => {
    const { body } = req;
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      const { wishlist } = loggedInUser;
      wishlist.forEach(album => {
        if (album.albumId === body.albumId) {
          album.comment = body.comment;
        }
      });
      await loggedInUser.save();
    }
    res.end();
  }

  const getWishlistAlbum = async (req, res) => {
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      const { wishlist } = loggedInUser;
      const wishlistAlbum = wishlist.filter(album => album._id.toString() === req.params.id);
      res.json(wishlistAlbum[0]);
    }
  }

  return {
    getUserWishlist,
    addAlbumToWishlist,
    removeAlbumFromWishlist,
    updateWishlistAlbumComment,
    getWishlistAlbum,
  }

})();

module.exports = WishlistControllers
