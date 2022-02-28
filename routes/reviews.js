const reviewsRouter = require('express').Router();
const ReviewControllers = require('../controllers/reviewControllers');

reviewsRouter.post('/', (req, res, next) => ReviewControllers.addAlbumReview(req, res, next));

reviewsRouter.put('/vote', (req, res, next) =>  ReviewControllers.reviewVote(req, res, next));

reviewsRouter.get('/userReviews', (req, res, next) => ReviewControllers.getUsersAlbumReviews(req, res, next));

reviewsRouter.get('/votedReviews', (req, res, next) => ReviewControllers.getUsersVotedReviews(req, res, next));

reviewsRouter.get('/:albumId', (req, res) => ReviewControllers.getReviewsForAlbum(req, res));

module.exports = reviewsRouter;