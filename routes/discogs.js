const discogsRouter = require('express').Router();
const dotenv = require('dotenv');
dotenv.config();
const Cache = require('../cache');
const cache = new Cache(3600);

const TOKEN = process.env.TOKEN;

discogsRouter.get('/pop', async (req, res) => {
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=pop&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'none'});
  res.json(data);
});

discogsRouter.get('/hiphop', async (req, res) => {
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=hip+hop&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'none'});
  res.json(data);
});

discogsRouter.get('/jazz', async (req, res) => {
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=jazz&type=release&country=US&per_page=75&year=2021&token=${TOKEN}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'none'});
  res.json(data);
});

discogsRouter.get('/:type/:id', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  const requestUrl = `https://api.discogs.com/${req.params.type}/${req.params.id}`;
  const headers = {
    withCrendentials: true,
  }
  const data = await cache.get(requestUrl, headers);
  res.cookie(requestUrl, data, { sameSite: 'none'});
  res.json(data);
});

module.exports = discogsRouter;