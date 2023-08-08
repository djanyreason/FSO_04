require('dotenv').config();

const PORT = process.env.PORT || 3003;
const BLOGDB_URI = process.env.BLOGLISTDB_URI;

module.exports = {
  BLOGDB_URI,
  PORT
};