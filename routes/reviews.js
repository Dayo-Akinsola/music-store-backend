const reviewsRouter = require('express').Router();
const ReviewControllers = require('../controllers/reviewControllers');

reviewsRouter.post('/', (req, res) => ReviewControllers.addAlbumReview(req, res));

reviewsRouter.put('/vote', (req, res) =>  ReviewControllers.reviewVote(req, res));

reviewsRouter.get('/userReviews', (req, res) => ReviewControllers.getUsersAlbumReviews(req, res));

reviewsRouter.get('/votedReviews', (req, res) => ReviewControllers.getUsersVotedReviews(req, res));

reviewsRouter.get('/:albumId', (req, res) => ReviewControllers.getReviewsForAlbum(req, res));


module.exports = reviewsRouter;