const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (req, res, next) => {
  const { body } = req;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
  
  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
    orders: [],
  });


  try{
    const savedUser = await user.save();
    res.json(savedUser);
  } catch(exception) {
    next(exception);
  }
  
});


module.exports = usersRouter;

