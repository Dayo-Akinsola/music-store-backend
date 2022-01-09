const express = require('express');
const app = express();
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const TOKEN = process.env.TOKEN;

app.get('/pop', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const apiCall = await axios.get(`https://api.discogs.com/database/search?&format=album&style=pop&country=US&per_page=25&year=2021&token=${TOKEN}`);
  const data = apiCall.data;
  response.json(data);
});

app.get('/hiphop', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const apiCall = await axios.get(`https://api.discogs.com/database/search?&format=album&style=hip+hop&country=US&per_page=25&year=2021&token=${TOKEN}`);
  const data = apiCall.data;
  response.json(data);
});

app.get('/jazz', async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  const apiCall = await axios.get(`https://api.discogs.com/database/search?&format=album&style=jazz&country=US&per_page=25&year=2021&token=${TOKEN}`);
  const data = apiCall.data;
  response.json(data);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});