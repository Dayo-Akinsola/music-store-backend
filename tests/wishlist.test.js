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

    wishlist = await api
      .delete('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send({albumId: 123})
      .expect(200)
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

  test("A user should be able to update a comment in their wishlist", async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;
    const wishListAlbum = await WishlistHelpers.createWishlistAlbum(123);


    await api
      .post('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send(wishListAlbum)
    
    const newComment = {
      albumId: 123, 
      comment: 'Please get me this album!!!',
    }
    
    await api
      .put('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send(newComment)
      .expect(200)
    
    const editedAlbum = await User.findOne({ albumId: 123});
    expect(editedAlbum.wishlist[0].comment).toContain('Please get me this album!!!');
  });

  test("User should be able to get a specific album from their wishlist", async () => {
    const userLogin = await api.post('/users/login').send({ username: 'JD123', password: 'rabbit77'});
    const token = userLogin.body.token;
    const wishListAlbum = await WishlistHelpers.createWishlistAlbum(123);

    await api
      .post('/wishlist')
      .set('authorization', `bearer ${token}`)
      .send(wishListAlbum)
    
    const user = await User.findOne({ albumId: 123});
    const album = user.wishlist[0];

    const result = await api
      .get(`/wishlist/${album._id.toString()}`)
      .set('authorization', `bearer ${token}`)
      .expect(200)
    
    expect(result.body._id).toBe(album._id.toString());
  
  });

})

afterAll(() => {
  mongoose.connection.close();
})