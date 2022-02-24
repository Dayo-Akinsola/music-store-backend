const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const Review = require('../models/review');
const { UserHelpers, ReviewHelpers } = require('./helpers');

const api = supertest(app);

describe('tests for a user posting a review for an album', () => {

  beforeEach(async() => {
    await User.deleteMany({});
    await Review.deleteMany({});
  });


  test('review should be posted when user is logged in', async () => {

    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const loggedInUser = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = loggedInUser.body.token;

    const review = ReviewHelpers.generateReview(1234, user);

    await api
      .post('/reviews')
      .set('authorization', `bearer ${token}`)
      .send(review)
      .expect(200)
  });

  test('get request should only get reviews for a specific album', async () => {
    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const loggedInUser = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = loggedInUser.body.token;

    const userTwo = await UserHelpers.createUser('Wale', 'WE123', 'turtle77');
    const loggedInUserTwo = await api.post('/users/login').send({ username: 'WE123', password: 'turtle77'});
    const tokenTwo = loggedInUserTwo.body.token;

    const firstReview = ReviewHelpers.generateReview(1, user);

    await api
    .post('/reviews')
    .set('authorization', `bearer ${token}`)
    .send(firstReview)

    for (let i = 0; i < 4; i++) {
      const review = ReviewHelpers.generateReview(i, userTwo);

      await api
        .post('/reviews')
        .set('authorization', `bearer ${tokenTwo}`)
        .send(review)
    }

    const albumReview = await api
      .get('/reviews/1')
      .expect(200)
    expect(albumReview.body[0].album.id).toBe(1);  
    expect(albumReview.body).toHaveLength(2);  
  });

  test("user should not be able to review the same album more than once", async () => {
    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const loggedInUser = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = loggedInUser.body.token;

    const review = ReviewHelpers.generateReview(1, user);

    await api
      .post('/reviews')
      .set('authorization', `bearer ${token}`)
      .send(review) 
    
    const dupeReview = ReviewHelpers.generateReview(1, user);

    const result = await api
      .post('/reviews')
      .set('authorization', `bearer ${token}`)
      .send(dupeReview)
      .expect(400)
    
    expect(result.body.error).toContain('You have already reviewed this album.')
  });

  test("user should be able to upvote and downvote another user's review", async () => {
    const userOne = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const userOneLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const tokenOne = userOneLogin.body.token;

    const review = ReviewHelpers.generateReview(1234, userOne);
    const result = await api
    .post('/reviews')
    .set('authorization', `bearer ${tokenOne}`)
    .send(review)
  

    await UserHelpers.createUser('Jane', 'RR123', 'gecko77');
    const userTwoLogin = await api.post('/users/login').send({ username: 'RR123', password: 'gecko77'});
    const tokenTwo = userTwoLogin.body.token;

    const userTwoVote = async (voteType) => {
      const albumReview = await api
        .put('/reviews/vote')
        .set('authorization', `bearer ${tokenTwo}`)
        .send({ vote: voteType, reviewId: result.body._id }) /* true for upvote false for downvote */
        .expect(200)
      return albumReview;
      
    }

    let albumReview = await userTwoVote(true);
    expect(albumReview.body.upvotes).toBe(1);

    albumReview = await userTwoVote(false);
    expect(albumReview.body.upvotes).toBe(0);
    expect(albumReview.body.downvotes).toBe(1);

    albumReview = await userTwoVote(false);
    expect(albumReview.body.upvotes).toBe(0);
    expect(albumReview.body.downvotes).toBe(0);

    await userTwoVote(true);
    albumReview = await userTwoVote(true);
    expect(albumReview.body.upvotes).toBe(0);
    expect(albumReview.body.downvotes).toBe(0)
  });    
});

afterAll(() => {
  mongoose.connection.close();
});

