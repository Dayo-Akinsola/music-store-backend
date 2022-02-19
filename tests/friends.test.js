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

    const friendUser = await User.findOne({ name: 'Wale'});
    const friendRequestInfo = {
      name: friendUser.name,
      id: friendUser._id,
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

  test('duplicate request should not be sent', async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;

    const friendUser = await User.findOne({ name: 'Wale'});
    const friendRequest = {
      name: friendUser.name,
      id: friendUser._id,
    }

    const dupeRequest = {
      name: friendUser.name,
      id: friendUser._id,
    }

    await api
      .post('/friends/request')
      .set('authorization', `bearer ${token}`)
      .send(friendRequest)
    
    await api 
      .post('/friends/request')
      .set('authorization', `bearer ${token}`)
      .send(dupeRequest)
      .expect(400)
  });
})

describe('tests for responding to a friend request',  () => {

  beforeEach( async () => {
    await User.deleteMany({});
    await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    await UserHelpers.createUser('Wale', 'WE123', 'horse887');
  });

  test('user should be able to accept a friend request', async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;

    const friendUser = await User.findOne({ name: 'Wale'});
    const friendRequest = {
      name: friendUser.name,
      id: friendUser._id,
    }

    await api
      .post('/friends/request')
      .set('authorization', `bearer ${token}`)
      .send(friendRequest)
  
    const friendLogin = await api.post('/users/login').send({ username: 'WE123', password: 'horse887'});
    const friendToken = friendLogin.body.token;

    await api
      .post('/friends/request/response')
      .set('authorization', `bearer ${friendToken}`)
      .send({ name: userLogin.body.name, username: userLogin.body.username, accept: true })
      .expect(200)
    
    const sender = await User.findOne({ username: userLogin.body.username, name: userLogin.body.name });
    const receiver = await User.findOne({ username: friendLogin.body.username, name: friendLogin.body.name });
    expect(sender.friends).toHaveLength(1);
    expect(receiver.friends).toHaveLength(1);
    expect(sender.sentRequests).toHaveLength(0);
    expect(receiver.receivedRequests).toHaveLength(0);
    });

  test('user should be able to decline a friend request', async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;

    const friendUser = await User.findOne({ name: 'Wale'});
    const friendRequest = {
      name: friendUser.name,
      id: friendUser._id,
    }

    await api
    .post('/friends/request')
    .set('authorization', `bearer ${token}`)
    .send(friendRequest)

    const friendLogin = await api.post('/users/login').send({ username: 'WE123', password: 'horse887'});
    const friendToken = friendLogin.body.token;

    await api
      .post('/friends/request/response')
      .set('authorization', `bearer ${friendToken}`)
      .send({ name: userLogin.body.name, username: userLogin.body.username, accept: false })
      .expect(200)
    
      const sender = await User.findOne({ username: userLogin.body.username, name: userLogin.body.name });
      const receiver = await User.findOne({ username: friendLogin.body.username, name: friendLogin.body.name });
      expect(sender.friends).toHaveLength(0);
      expect(receiver.friends).toHaveLength(0);
      expect(sender.sentRequests).toHaveLength(0);
      expect(receiver.receivedRequests).toHaveLength(0);
    });
});

describe('tests for view requests', () => {
  beforeEach(async() => {
    await User.deleteMany({});
    await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    await UserHelpers.createUser('Wale', 'WE123', 'horse887');
  });

  test('user should be able to view received requests',  async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;

    const friendUser = await User.findOne({ name: 'Wale'});
    const friendRequest = {
      name: friendUser.name,
      id: friendUser._id,
    }
  
    await api
    .post('/friends/request')
    .set('authorization', `bearer ${token}`)
    .send(friendRequest)
  
    const friendLogin = await api.post('/users/login').send({ username: 'WE123', password: 'horse887'});
    const friendToken = friendLogin.body.token;
  
    const result = await api
      .get('/friends/request/received')
      .set('authorization', `bearer ${friendToken}`)
      .expect(200)
    
    expect(result.body).toHaveLength(1);
    expect(result.body[0].name).toBe('John'); 
  });
});
  

afterAll(() => {
  mongoose.connection.close();
})