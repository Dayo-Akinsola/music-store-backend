const Review = require('../models/review');
const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');
const logInUser = require('./controllerHelper');

const ReviewControllers = (() => {

  const addAlbumReview = async (req, res) => {
    const { body } = req;
    const loggedInUser = await logInUser(req);
  
    if (loggedInUser) {
      const userReviewsPopulated = await loggedInUser.populate({ path: 'reviews', select: 'albumId'});
      const reviewCheck = userReviewsPopulated.reviews.filter(review => review.albumId === body.albumId);
      if (reviewCheck.length !== 0) {
        return res.status(400).json({ error: 'You have already reviewed this album.'})
      }
  
      const review = new Review({
        albumId: body.albumId,
        user: loggedInUser._id,
        rating: body.rating,
        headline: body.headline,
        reviewText: body.reviewText,
        date: body.date,
        upvotes: 0,
        downvotes: 0,
      });

      loggedInUser.reviews.push(review._id);
      await review.save();
      await loggedInUser.save();
      res.json(review);
    }
    else {
      return res.status(401).json({ error: 'You must be logged in to review an album.'});
    }
  }

  const getReviewsForAlbum = async (req, res) => {
    const albumReviews = await Review.find({ albumId: req.params.albumId})  
      .populate({ path: 'user', select: 'name'});
    res.json(albumReviews);
  }

  const reviewVote = async (req, res) => {
    const { body } = req;
    const review = await Review.findOne({ _id: body.reviewId});
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      let matchIndex;
      const reviewIdMatch = loggedInUser.votedReviews.filter((review, index) => {
        if (review.reviewId.toString() === body.reviewId) {
          matchIndex = index;
          return true;
        }
      });
      if (reviewIdMatch.length !== 0) {
        if (reviewIdMatch[0].vote === body.vote) {
          loggedInUser.votedReviews.splice(matchIndex, 1);
          (body.vote) ? review.upvotes -= 1 : review.downvotes -= 1;
  
        } else {
          loggedInUser.votedReviews[matchIndex].vote = !loggedInUser.votedReviews[matchIndex].vote;
          (body.vote) ? (review.downvotes -= 1, review.upvotes += 1) : (review.downvotes += 1, review.upvotes -= 1);
        }
      } else {
        loggedInUser.votedReviews.push(body);
        (body.vote) ? review.upvotes += 1 : review.downvotes += 1;
      }
      await review.save();
      await loggedInUser.save();
      res.json(review);
    } else {
      return res.status(400).json({ error: 'You must be logged in to vote.'});
    }
  }

  const getUsersAlbumReviews = async (req, res) => {
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      const userReviews = await Review.find({user: loggedInUser._id});
      res.json(userReviews);
    }
  }

  const getUsersVotedReviews = async (req, res) => {
    const loggedInUser = await logInUser(req);

    if (loggedInUser) {
      res.json(loggedInUser.votedReviews);
    }
  }

  return {
    addAlbumReview,
    getReviewsForAlbum,
    reviewVote,
    getUsersAlbumReviews,
    getUsersVotedReviews,
  }
})();

module.exports = ReviewControllers;