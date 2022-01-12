const NodeCache = require('node-cache');
const axios = require('axios');

class Cache {
  constructor(ttl) {
    this.cache = new NodeCache( { stdTTL: ttl, checkperiod: ttl * 0.2 } )
  }

  async get(requestUrl) {
    const cachedRequest = this.cache.get(requestUrl);

    if (cachedRequest) {
      const cachedData = await cachedRequest;
      return cachedData;
    }

    const response = await axios.get(requestUrl);
    const data = response.data;
    this.cache.set(requestUrl, data);
    return data;
  }

  deleteCache() {
    this.cache.flushAll();
  }
}

module.exports = Cache;