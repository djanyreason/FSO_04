const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const blogListRouter = require('./controllers/blogs');
const mongoose = require('mongoose');

mongoose.connect(config.BLOGDB_URI);

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogListRouter);

module.exports = app;