const NodeCache = require('node-cache');
const axios = require('axios');

class Cache {
  constructor(ttl) {
    this.cache = new NodeCache( { stdTTL: ttl, checkperiod: ttl * 0.2 } )
  }

  async get(requestUrl, headers) {
    const cachedRequest = this.cache.get(requestUrl);

    if (cachedRequest) {
      const cachedData = await cachedRequest;
      return cachedData;
    }

    const response = headers !== null ? await axios.get(requestUrl, {headers: headers}) : await axios.get(requestUrl);
    const data = response.data;
    console.log(data);
    this.cache.set(requestUrl, data);
    return data;
  }

  async getAccessToken(request, options) {
    const cachedRequest = this.cache.get(request);

    if (cachedRequest) {
      const cachedToken = await cachedRequest;
      return cachedToken;
    }

    const response = await axios(options);
    const data = response.data;
    this.cache.set(request, data);
    return data;
  }

  deleteCache() {
    this.cache.flushAll();
  }
}

module.exports = Cache;