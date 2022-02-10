const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const bcrypt = require('bcrypt');


const UserHelpers = (() => {

  const usersInDb = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
  }

  const createUser = async (name, username, password) => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      username, 
      passwordHash
    });

    const savedUser = await newUser.save();
    return savedUser;
  }

  return {
    usersInDb,
    createUser,
  }
})();

const OrderHelpers = (() => {

  const _initialOrders = [
    {
      orderDate: '04/02/2022',
      deliveryAddress: '123 Random Street',
      albums: [
        {
          id: '12345',
          title: 'Album',
          price: 12.99,
          cover_image: 'picture_url'
        },
        {
          id: '1245',
          title: 'Album2',
          price: 13.99,
          cover_image: 'picture_url2'
        },
      ],
    },
    {
      orderDate: '05/02/2022',
      deliveryAddress: '12 Random Street',
      albums: [
        {
          id: '11',
          title: 'Album3',
          price: 10.99,
          cover_image: 'picture_url3'
        },
        {
          id: '43',
          title: 'Album4',
          price: 9.99,
          cover_image: 'picture_url4'
        },
      ],
    } 
  ];

  const saveInitialOrders = async () => {
    await Order.deleteMany({});
    await Order.insertMany(_initialOrders);
  }

  const ordersInDb = async () => {
    const orders = await Order.find({});
    return orders.map(order => order.toJSON());
  }

  return {
    saveInitialOrders,
    ordersInDb,
  }
 })();

 const ReviewHelpers = (() => {
  const generateReview = async (albumId, user) => {
    const review = new Review({
      albumId,
      user,
      rating: 5,
      headline: 'Great Album',
      reviewText: '10/10 would buy again.',
      date: '23 March 2022',
      upvotes: 0,
      downvotes: 0,
    });

    await review.save();
    return review;
  }

  return {
    generateReview,
  }
 })();

 const WishlistHelpers = (() => {

  const createWishlistAlbum = async (albumId) => {
    const album = {
      albumId,
      title: 'new album',
      thumb: 'new album image',
      price: 11.99,
      dateAdded: '10 March 2022',
    }

    return album;
  }

  return {
    createWishlistAlbum,
  }
})();

module.exports = { UserHelpers, OrderHelpers, ReviewHelpers, WishlistHelpers }