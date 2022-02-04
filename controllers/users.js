const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (req, res) => {
  const { body } = req;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
  
  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
    orders: [],
  });

  const savedUser = await user.save();
  res.json(savedUser);
});

usersRouter.put('/', async (req, res) => {
  const { body } = req;
})

module.exports = usersRouter;
