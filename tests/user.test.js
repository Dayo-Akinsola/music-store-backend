const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const { UserHelpers, OrderHelpers, ReviewHelpers } = require('./helpers');

const api = supertest(app);

describe('tests for user creation', () => {

  beforeEach( async () => {
    await User.deleteMany({});
    await UserHelpers.createUser('John', 'JD123', 'rabbit');
  })

  test('new user should be created with unique credentials', async () => {
    const newUser = {
      name: 'Dayo',
      username: 'random',
      password: 'ok123',
    }
    await api
      .post('/users/register')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  });

  test('user creation should fail with non unique username', async () => {
    const newUser = {
      name: 'Sarah',
      username: 'JD123',
      password: 'dog123',
    }

    const result = await api
      .post('/users/register')
      .send(newUser)
      .expect(400)
    
    expect(result.body.error).toContain('Username already exists');

    const allUsers = await UserHelpers.usersInDb();
    expect(allUsers).toHaveLength(1);
  });

  test('user creation should fail with username length < 5', async () => {
    const newUser = {
      name: 'John',
      username: 'Pop',
      password: 'Miki123',
    }

    await api
      .post('/users/register')
      .send(newUser)
      .expect(400)
    
      const allUsers = await UserHelpers.usersInDb();
      expect(allUsers).toHaveLength(1);  
    });

    test('user should be able to login with correct credentials', async () => {
      const credentials = {
        username: 'JD123',
        password: 'rabbit',
      } 

      await api
        .post('/users/login')
        .send(credentials)
        .expect(200)
    });

    test('login should fail with incorrect username', async () => {
      const credentials = {
        username: 'JD12',
        password: 'rabbit',
      }

      const result = await api
        .post('/users/login')
        .send(credentials)
        .expect(401)
      
      expect(result.error.text).toContain('Incorrect Username or Password');
    });

    test('login should fail with correct username and incorrect password', async () => {
      const credentials = {
        username: 'JD123',
        password: 'badPassword',
      }

      const result = await api
      .post('/users/login')
      .send(credentials)
      .expect(401)
    
      expect(result.error.text).toContain('Incorrect Username or Password');

    })
})

describe('tests for guest making an order', () => {

  beforeEach( async () => {
    Order.deleteMany({});
    await OrderHelpers.saveInitialOrders();
  });

  test('new order should be added to orders collection', async () => {
    const newOrder = {
      orderDate: '01/02/2022',
      deliveryAddress: '05 Random Street',
      albums: [
        {
          id: '2',
          title: 'Album3',
          price: 10.99,
          cover_image: 'picture_url3'
        },
        {
          id: '212',
          title: 'Album4',
          price: 9.99,
          cover_image: 'picture_url4'
        },
      ],
    }

    await api
      .post('/orders')
      .send(newOrder)
      .expect(200)
    
    const allOrders = await OrderHelpers.ordersInDb();
    expect(allOrders).toHaveLength(3);
  });
});

describe('tests for logged in user making an order', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Order.deleteMany({});
    await OrderHelpers.saveInitialOrders();
  });

  test('new order should be added to orders and correct user collection', async () => {
    const newOrder = {
      orderDate: '01/02/2022',
      deliveryAddress: '05 Random Street',
      albums: [
        {
          id: '2',
          title: 'Album3',
          price: 10.99,
          cover_image: 'picture_url3'
        },
        {
          id: '212',
          title: 'Album4',
          price: 9.99,
          cover_image: 'picture_url4'
        },
      ],
    }

    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit');
    const loggedInUser = await api.post('/users/login').send({ username: user.username, password: 'rabbit'});
    const token = loggedInUser.body.token;
  
    await api
      .post('/orders')
      .set('authorization', `bearer ${token}`)
      .send(newOrder)
      .expect(200)
    
    const orders = await OrderHelpers.ordersInDb();
    expect(orders).toHaveLength(3);
    const userCheck = await User.findOne({ username: 'JD123' });
    expect(userCheck.orders).toHaveLength(1);
  });
});

describe('tests for a user controlling their cart', () => {

  beforeEach(async() => {
    await User.deleteMany({});
  })

  test("album not it cart should be added to user's cart array", async () => {
    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit');
    const loggedInUser = await api.post('/users/login').send({ username: user.username, password: 'rabbit'});
    const token = loggedInUser.body.token;

    const newCartAlbum = {
      title: 'Cart Album',
      price: 23.44,
      thumb: 'album_picture',
      id: 12334,
      quantity: 3,
    }

    await api
      .put('/users/cart')
      .set('authorization', `bearer ${token}`)
      .send(newCartAlbum)
      .expect(200)

    const updatedUser = await User.findById(user.id);
    expect(updatedUser.cart).toHaveLength(1);
  });
  
  test("album already in the user's cart should have its quantity updated", async () => {
    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const loggedInUser = await api.post('/users/login').send({ username: user.username, password: 'rabbit77'});
    const token = loggedInUser.body.token;

    const newCartAlbum = {
      title: 'Cart Album',
      price: 23.44,
      thumb: 'album_picture',
      id: 12334,
      quantity: 3,
    }

    await api
      .put('/users/cart')
      .set('authorization', `bearer ${token}`)
      .send(newCartAlbum)
    
      await api
      .put('/users/cart')
      .set('authorization', `bearer ${token}`)
      .send(newCartAlbum)
      .expect(200)  
    
    const updatedUser = await User.findById(user.id);
    expect(updatedUser.cart).toHaveLength(1);
    expect(updatedUser.cart[0].quantity).toBe(6);
    });

    test("all a user's albums should be removed from their cart", async () => {
      const user = await UserHelpers.createUser('Jane', 'JA123', 'gecko111');
      const loggedInUser = await api.post('/users/login').send({ username: user.username, password: 'gecko111'});
      const token = loggedInUser.body.token;

      const newCartAlbumOne = {
        title: 'Cart Album',
        price: 23.44,
        thumb: 'album_picture',
        id: 12334,
        quantity: 3,
      }

      const newCartAlbumTwo = {
        title: 'Cart Album 2',
        price: 21.44,
        thumb: 'album_picture2',
        id: 12335,
        quantity: 2,
      }

      await api
      .put('/users/cart')
      .set('authorization', `bearer ${token}`)
      .send(newCartAlbumOne)
      .expect(200)  

      await api
      .put('/users/cart')
      .set('authorization', `bearer ${token}`)
      .send(newCartAlbumTwo)
      .expect(200)  

      await api
        .delete('/users/cart/clear')
        .set('authorization', `bearer ${token}`)
        .expect(204);
      
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.cart).toHaveLength(0);
    })
})

describe('tests for a user posting a review for an album', () => {

  beforeEach(async() => {
    await User.deleteMany({});
    await Review.deleteMany({});
  });


  test('review should be posted when user is logged in', async () => {

    const user = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const loggedInUser = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = loggedInUser.body.token;

    const review = await ReviewHelpers.generateReview(1234, user);

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

    const firstReview = await ReviewHelpers.generateReview(1, user);

    await api
    .post('/reviews')
    .set('authorization', `bearer ${token}`)
    .send(firstReview)

    for (let i = 0; i < 4; i++) {
      const review = await ReviewHelpers.generateReview(i, user);

      await api
        .post('/reviews')
        .set('authorization', `bearer ${token}`)
        .send(review)
    }

    const albumReview = await api
      .get('/reviews/1')
      .expect(200)
    expect(albumReview.body[0].albumId).toBe(1);  
    expect(albumReview.body).toHaveLength(2);  
  });

  test("user should be able to upvote and downvote another user's review", async () => {
    const userOne = await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    const userOneLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const tokenOne = userOneLogin.body.token;

    const review = await ReviewHelpers.generateReview(1234, userOne);
    await api
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
        .send({ vote: voteType, reviewId: review._id }) /* true for upvote false for downvote */
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


