const wishlistRouter = require('express').Router();
const WishlistControllers = require('../controllers/wishlistControllers');

wishlistRouter.get('/', (req, res, next) => WishlistControllers.getUserWishlist(req, res, next));

wishlistRouter.post('/', (req, res, next) => WishlistControllers.addAlbumToWishlist(req, res, next));

wishlistRouter.delete('/', (req, res, next) => WishlistControllers.removeAlbumFromWishlist(req, res, next));

wishlistRouter.put('/', (req, res, next) => WishlistControllers.updateWishlistAlbumComment(req, res, next));

wishlistRouter.get('/:id', (req, res, next) => WishlistControllers.getWishlistAlbum(req, res, next));

wishlistRouter.put('/image', (req, res) => WishlistControllers.replaceWishlistAlbumImage(req, res));

module.exports = wishlistRouter;