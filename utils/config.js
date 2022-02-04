require('dotenv').config();

const PORT = process.env.PORT || 3001;
const dbUrl = (process.env.NODE_ENV === 'test' ) ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;

module.exports = { PORT, dbUrl };