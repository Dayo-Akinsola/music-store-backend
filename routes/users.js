const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { getToken, getLoggedInUser } = require('../helpers/serviceHelpers');

usersRouter.post('/register', async (req, res, next) => {
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
});

usersRouter.post('/login', async (req, res) => {
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

  res.status(200).send({token, username: loggedInUser.username, name: loggedInUser.name});
});

usersRouter.get('/details', async (req, res, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  res.json(loggedInUser.details);
});

usersRouter.put('/details', async (req, res) => {
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

  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  loggedInUser.details = userDetails;
  await loggedInUser.save();
  res.json();
})


usersRouter.get('/cart', async (req, res, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  res.json(loggedInUser.cart);
});

usersRouter.put('/cart', async (req, res, next) => {
  const { body } = req;

  const albumData = {
    title: body.title,
    price: body.price,
    thumb: body.thumb,
    id: body.id,
    quantity: body.quantity,
  }

  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
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
});

usersRouter.delete('/cart', async (req, res, next) => {
  const id = req.body.id;
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  const albumToDeleteIndex = loggedInUser.cart.findIndex(album => album.id === id);
  loggedInUser.cart.splice(albumToDeleteIndex, 1);
  await loggedInUser.save();
  res.json(loggedInUser.cart);
});

usersRouter.delete('/cart/clear', async (req, res, next) => {
  const token = getToken(req);
  const loggedInUser = await getLoggedInUser(token, next);
  loggedInUser.cart = [];
  await loggedInUser.save();
  return res.status(204).json();
})

module.exports = usersRouter;

