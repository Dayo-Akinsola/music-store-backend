const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const { UserHelpers, OrderHelpers } = require('./helpers');

const api = supertest(app);

describe('tests for user creation', () => {

  beforeEach( async () => {
    await User.deleteMany({});
    await UserHelpers.createInitialUser('John', 'JD123', 'rabbit');
  })

  test('new user should be created with unique credentials', async () => {
    const newUser = {
      name: 'Dayo',
      username: 'random',
      password: 'ok123',
    }
    await api
      .post('/users')
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
      .post('/users')
      .send(newUser)
      .expect(400)
    
    expect(result.body.error).toContain('`username` to be unique');

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
      .post('/users')
      .send(newUser)
      .expect(400)
    
    
      const allUsers = await UserHelpers.usersInDb();
      expect(allUsers).toHaveLength(1);  
    });
})

describe('test for the making of an order', () => {

})


afterAll(() => {
  mongoose.connection.close();
})


