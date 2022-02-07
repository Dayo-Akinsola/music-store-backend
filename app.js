const { dbUrl } = require('./utils/config');
const express = require('express');
const app = express();
const discogsRouter = require('./controllers/discogs');
const spotifyRouter = require('./controllers/spotify');
const usersRouter = require('./controllers/users');
const ordersRouter = require('./controllers/orders');
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

const middleware = require('./utils/middleware');

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);


module.exports = app;


