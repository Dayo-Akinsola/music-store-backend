const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const Order = require('../models/order');
const { UserHelpers, OrderHelpers } = require('./helpers');

const api = supertest(app);

describe('test for viewing orders', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Order.deleteMany({});
    await UserHelpers.createUser('John', 'JD123', 'rabbit77');
    await UserHelpers.createUser('Wale', 'WE123', 'horse887');
  });

  test('A user should be able to get all their orders', async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;
  
    const newOrder = OrderHelpers.createOrder();
  
    for (let i = 0; i < 2; i++) {
      await api
      .post('/orders')
      .set('authorization', `bearer ${token}`)
      .send(newOrder)
      .expect(200)
    }
  
    const orders = await api
      .get('/orders')
      .set('authorization', `bearer ${token}`)
      .expect(200)
    expect(orders.body).toHaveLength(2);
   
  });
});

describe('tests for guest making an order', () => {

  beforeEach( async () => {
    Order.deleteMany({});
    await OrderHelpers.saveInitialOrders();
  });

  test('new order should be added to orders collection', async () => {
    const newOrder = {
      orderDate: Date.now(),
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
      orderDate: Date.now(),
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

afterAll(() => {
  mongoose.connection.close();
});