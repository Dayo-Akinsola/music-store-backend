const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const Review = require('../models/review');
const { UserHelpers, ReviewHelpers } = require('./helpers');

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
});

afterAll(() => {
  mongoose.connection.close();
});


