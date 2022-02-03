const spotifyRouter = require('express').Router();
const dotenv = require('dotenv');
dotenv.config();
const { Buffer } = require('buffer');
const Cache = require('../cache');
const cache = new Cache(3600);

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

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

spotifyRouter.get('/:albumName', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { access_token } = await cache.getAccessToken('access_token', authOptions);
  const headers = {
      'Authorization' : `Bearer ${access_token}`,
  }
  const requestUrl = `https://api.spotify.com/v1/search?q=album%3A${encodeURIComponent(req.params.albumName)}&type=album&market=ES&limit=50&offset=0`;
  const data = await cache.get(requestUrl, headers);
  res.json(data);
});

spotifyRouter.get('/:albumID/tracks', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { access_token } = await cache.getAccessToken('access_token', authOptions);
  const headers = {
      'Authorization' : `Bearer ${access_token}`,
  }
  const requestUrl = `https://api.spotify.com/v1/albums/${req.params.albumID}/tracks?market=ES`;
  const data = await cache.get(requestUrl, headers);
  res.json(data);
});

module.exports = spotifyRouter;