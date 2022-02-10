const { dbUrl } = require('./utils/config');
const express = require('express');
const app = express();
const discogsRouter = require('./routes/discogs');
const spotifyRouter = require('./routes/spotify');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');
const wishlistRouter = require('./routes/wishlist');
const friendsRouter = require('./routes/friends');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, })
  .then(() => {
  console.log('connect to DB');
  })
  .catch((error) => {
  console.log('failed to connect to DB', error.message)
  });


app.use(cors());
app.use(express.json());

app.use('/discogs', discogsRouter);
app.use('/spotify', spotifyRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/reviews', reviewsRouter);
app.use('/wishlist', wishlistRouter);
app.use('/friends', friendsRouter);

const middleware = require('./utils/middleware');

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);


module.exports = app;


