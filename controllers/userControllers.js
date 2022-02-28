const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');
const { isUserLoggedIn , logInUser }  = require('./controllerHelpers');

const UserControllers = (() => {

  const registerUser = async (req, res, next) => {
    const { body } = req;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);
    
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
      orders: [],
      cart: [],
    });
  
    const uniqueUsernameCheck = await User.findOne({username: body.username});
    if (uniqueUsernameCheck) {
      return res.status(400).json({error: 'Username already exists'});
    }
  
    try{
      const savedUser = await user.save();
      res.json(savedUser);
    } catch(exception) {
      next(exception);
    }
  }

  const userLogin = async (req, res) => {
    const { body } = req;
    const loggedInUser = await User.findOne({ username: body.username });
    const passwordCorrect = (loggedInUser === null) ? false : await bcrypt.compare(body.password, loggedInUser.passwordHash);
    if (!(loggedInUser && passwordCorrect)) {
      return res.status(401).json({
        error: 'Incorrect Username or Password',
      });
    }
  
    const userForToken = {
      username: loggedInUser.username,
      id: loggedInUser._id,
    }
  
    const token = jwt.sign(userForToken, process.env.SECRET);
  
    res.status(200).send({token, username: loggedInUser.username, name: loggedInUser.name, id: loggedInUser._id});
  }

  const getUserDetails = async (req, res, next) => {
    if (!isUserLoggedIn(req)) {
      res.status(401).json(null);
    } else {
      const loggedInUser = await logInUser(req, next);
      if (loggedInUser) {
        res.json(loggedInUser.details);
      }
    }
  }

  const updateUserDetails = async (req, res, next) => {
    if (!isUserLoggedIn(req)) {
      res.end();
    }
    const { body } = req;
    const userDetails = {
      firstName: body.firstName,
      lastName: body.lastName,
      city: body.city,
      address: body.address,
      postCode: body.postCode,
      phone: body.phone,
      email: body.email,
    }
    
    const loggedInUser = await logInUser(req, next);
    if (loggedInUser) {
      loggedInUser.details = userDetails;
      await loggedInUser.save();
      res.json();
    }
  }

  const getCartAlbums = async (req, res, next) => {
    const loggedInUser =  await logInUser(req, next);
    res.json(loggedInUser.cart);
  }

  const updateCart = async (req, res, next) => {
    const { body } = req;

    const albumData = {
      title: body.title,
      price: body.price,
      thumb: body.thumb,
      id: body.id,
      quantity: body.quantity,
    }
  
    const loggedInUser = await logInUser(req, next);
    let albumIndex;
    const matchingAlbum = loggedInUser.cart.filter((album, index) => {
      if (album.id === body.id) {
        albumIndex = index;
        return true;
      }
    });
    /* replace value is a boolean that says whether the quantity should be replaced or incremented */
    if (body.replace) {
      loggedInUser.cart[albumIndex].quantity = albumData.quantity
    } else if (matchingAlbum.length === 0) {
      loggedInUser.cart.push(albumData);
    } else {
      loggedInUser.cart[albumIndex].quantity += albumData.quantity;
    }
    await loggedInUser.save();
    res.json(loggedInUser.cart);
  }

  const deleteCartAlbum = async (req, res, next) => {
    const id = req.body.id;
    const loggedInUser = await logInUser(req, next);
    const albumToDeleteIndex = loggedInUser.cart.findIndex(album => album.id === id);
    loggedInUser.cart.splice(albumToDeleteIndex, 1);
    await loggedInUser.save();
    res.json(loggedInUser.cart);
  }

  const clearCart = async (req, res, next) => {

    if (isUserLoggedIn(req)) {
      const loggedInUser = await logInUser(req, next);

      if (loggedInUser) {
        loggedInUser.cart = [];
        await loggedInUser.save();
      }
    }
    return res.status(204).json({});
  }

  const getUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id})
      .populate({ path: 'friends', select: 'name username'})
      .populate({ path: 'votedReviews', select: 'reviewId'})
      .populate({ path: 'reviews'});
    
    const dataToSend = {
      name: user.name,
      reviews: user.reviews,
      friends: user.friends,
      votedReviews: user.votedReviews,
      wishlist: user.wishlist,
      id: user._id,
    }
    res.json(dataToSend);
  }


  return {
    registerUser,
    userLogin,
    getUserDetails,
    updateUserDetails,
    getCartAlbums,
    updateCart,
    deleteCartAlbum,
    clearCart,
    getUser,
  }

})();

module.exports = UserControllers;
