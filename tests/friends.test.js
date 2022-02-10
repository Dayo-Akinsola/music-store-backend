const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const { UserHelpers } = require('./helpers');

const api = supertest(app);

describe('tests for sending a friend request', () => {
  beforeEach( async () => {
    await User.deleteMany({});
    await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    await UserHelpers.createUser('Wale', 'WE123', 'horse887');
  });

  test('user should be able to send a friend request to another user', async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;

    const friendRequestInfo = {
      name: 'Wale',
      username: 'WE123',
    }

    await api
      .post('/friends/request')
      .set('authorization', `bearer ${token}`)
      .send(friendRequestInfo)
      .expect(200)

    const user = await User.findOne({ name: 'John', username: 'JD123'})
    const friend = await User.findOne({ name: 'Wale', username: 'WE123'});
    expect(user.sentRequests).toHaveLength(1);
    expect(friend.receivedRequests).toHaveLength(1);
  });
})


afterAll(() => {
  mongoose.connection.close();
})