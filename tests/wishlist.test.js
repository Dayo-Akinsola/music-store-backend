const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const User = require('../models/user');
const { UserHelpers, WishlistHelpers } = require('./helpers');

const api = supertest(app);

describe("tests for a user adding and removing items from their wishlist", () => {

  beforeEach(async () => {
    await User.deleteMany({});
    await UserHelpers.createUser('John', 'JD123', 'rabbit77');
  });

  test("A user should be able to add and remove an album from their wishlist", async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;
    const wishListAlbum = await WishlistHelpers.createWishlistAlbum(123);

    let wishlist = await api
      .post('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send(wishListAlbum)
      .expect(200)

    expect(wishlist.body).toHaveLength(1);

    wishlist = await api
      .delete('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send({albumId: 123})
      .expect(200)

    expect(wishlist.body).toHaveLength(0);
  });

  test("user should be able to get contents of their wishlist", async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;
    const wishListAlbum = await WishlistHelpers.createWishlistAlbum(123);

    await api
      .post('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send(wishListAlbum)
      .expect(200)
      
    const wishlist = await api
      .get('/wishlist')
      .set('authorization', `bearer ${token}`)
      .expect(200)
      
    expect(wishlist.body).toHaveLength(1);
      
  });

})

afterAll(() => {
  mongoose.connection.close();
})