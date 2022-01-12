const express = require('express');
const app = express();
const dotenv = require('dotenv');
const Cache = require('./cache');
dotenv.config();
const TOKEN = process.env.TOKEN;
const cache = new Cache(3600);

app.get('/pop', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=pop&type=release&country=US&per_page=25&year=2021&token=${TOKEN}`;
  const data = await cache.get(requestUrl);
  response.json(data);
});

app.get('/hiphop', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=hip+hop&type=release&country=US&per_page=25&year=2021&token=${TOKEN}`;
  const data = await cache.get(requestUrl);
  response.json(data);
});

app.get('/jazz', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=jazz&type=release&country=US&per_page=25&year=2021&token=${TOKEN}`;
  const data = await cache.get(requestUrl);
  response.json(data);
});

app.get('/:type/:id', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/${request.params.type}/${request.params.id}`;
  const data = await cache.get(requestUrl);
  response.json(data);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});