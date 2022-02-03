const express = require('express');
const app = express();
const config = require('./utils/config');
const cookieParser = require('cookie-parser');
const discogsRouter = require('./controllers/discogs');
const spotifyRouter = require('./controllers/spotify');
const usersRouter = require('./controllers/users');

app.use( (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  cookieParser();
  next();
});

app.use('/discogs', discogsRouter);
app.use('/spotify', spotifyRouter);
app.use('/users', usersRouter);


app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});