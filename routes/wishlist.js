const wishlistRouter = require('express').Router();
const WishlistControllers = require('../controllers/wishlistControllers');

wishlistRouter.get('/', (req, res) => WishlistControllers.getUserWishlist(req, res));

wishlistRouter.post('/', (req, res) => WishlistControllers.addAlbumToWishlist(req, res));

wishlistRouter.delete('/', (req, res) => WishlistControllers.removeAlbumFromWishlist(req, res));

wishlistRouter.put('/', (req, res) => WishlistControllers.updateWishlistAlbumComment(req, res));

wishlistRouter.get('/:id', (req, res) => WishlistControllers.getWishlistAlbum(req, res));

module.exports = wishlistRouter;