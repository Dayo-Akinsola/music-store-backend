const express = require('express');
const app = express();
const https = require('https');
const dotenv = require('dotenv');
const Cache = require('./cache');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Buffer } = require('buffer');
dotenv.config();
const TOKEN = process.env.TOKEN;
const cache = new Cache(3600);
const generateRandomString = require('./generateRandomString');

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectURI =   'http://localhost:3001/callback';

const stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())


app.get('/login', async (req, res) => {

  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirectURI,
      state: state,
  }).toString());
});

app.get('/callback', (req, res) => {

  const code = req.query.code || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;
  console.log(req.query);

  if (storedState === null) {
    res.redirect('/#' +
      new URLSearchParams({
        error: 'state_mismatch'
      }).toString());
  } else {
    res.clearCookie(stateKey);
    const url = 'accounts.spotify.com';
    const authOptions = {
      hostname: url,
      path: '/api/token',
      form: {
        code: code,
        redirect_uri: redirectURI,
        grant_type: 'authorization_code'
      },
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',        
        'Authorization': 'Basic ' + (Buffer.from(`${clientID}:${clientSecret}`).toString('base64')),
      },
      port: 3001,
    };
    
    console.log(authOptions.headers.Authorization);
    console.log(authOptions.form.code);

    const request = https.request(authOptions, (response) => {
      console.log(response.statusCode);
      if (response.statusCode === 200){
        console.log(response.body);
        const access_token = response.body.access_token;
        const refresh_token = response.body.refresh_token;

        // const options = {
        //   'content-type': 'application/json',          
        //   url: 'https://api.spotify.con/v1/me',
        //   headers: { 'Authorization': `Bearer ${access_token}` },
        //   json: true,
        //   method: 'GET'
        // };

        // const request2 = https.request(options, (response) => {
        //   console.log(response.body);
        // });

        res.redirect('/#' + 
          new URLSearchParams({
            access_token,
            refresh_token,
          }).toString());
        } 
      else {
        res.redirect('/#' +
          new URLSearchParams({
            error: 'invalid_token',
          }).toString());
      }
    });

    request.on('error', error => {
      console.group(error);
    });

    //request.end();
  }
})

app.get('/pop', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=pop&type=release&country=US&per_page=25&year=2021&token=${TOKEN}`;
  const data = await cache.get(requestUrl);
  res.json(data);
});

app.get('/hiphop', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=hip+hop&type=release&country=US&per_page=25&year=2021&token=${TOKEN}`;
  const data = await cache.get(requestUrl);
  res.json(data);
});

app.get('/jazz', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/database/search?&format=album&style=jazz&type=release&country=US&per_page=25&year=2021&token=${TOKEN}`;
  const data = await cache.get(requestUrl);
  res.json(data);
});

app.get('/:type/:id', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const requestUrl = `https://api.discogs.com/${req.params.type}/${req.params.id}`;
  const data = await cache.get(requestUrl);
  res.json(data);
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});