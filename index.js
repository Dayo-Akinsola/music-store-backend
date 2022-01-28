const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const Cache = require('./cache');
const { Buffer } = require('buffer');
dotenv.config();
const TOKEN = process.env.TOKEN;
const cache = new Cache(3600);

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  cookieParser();
  next();
});


/* Discogs endpoints */

app.get('/discogs/pop', async (req, res) => {
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=pop&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'lax'});
  res.json(data);
});

app.get('/discogs/hiphop', async (req, res) => {
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=hip+hop&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'lax'});
  res.json(data);
});

app.get('/discogs/jazz', async (req, res) => {
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=jazz&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'lax'});
  res.json(data);
});

app.get('/discogs/:type/:id', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  const requestUrl = `https://api.discogs.com/${req.params.type}/${req.params.id}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'lax'});
  res.json(data);
});

/* Spotify endpoints */ 

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.from(
      `${client_id}:${client_secret}`
    ).toString('base64'))
  },
  params: {
    grant_type: 'client_credentials',
  },
  method: 'post',
};

app.get('/spotify/:albumName', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { access_token } = await cache.getAccessToken('access_token', authOptions);
  const headers = {
    'Authorization' : `Bearer ${access_token}`,
  }
  const requestUrl = `https://api.spotify.com/v1/search?q=album%3A${encodeURIComponent(req.params.albumName)}&type=album&market=ES&limit=50&offset=0`;
  const data = await cache.get(requestUrl, headers);
  res.json(data);
});

app.get('/spotify/:albumID/tracks', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { access_token } = await cache.getAccessToken('access_token', authOptions);
  const headers = {
    'Authorization' : `Bearer ${access_token}`,
  }
  const requestUrl = `https://api.spotify.com/v1/albums/${req.params.albumID}/tracks?market=ES`;
  const data = await cache.get(requestUrl, headers);
  res.json(data);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});