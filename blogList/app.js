const config = require('./utils/config');
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const blogListRouter = require('./controllers/blogs');
const userRouter = require('./controllers/users');
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');

mongoose.connect(config.BLOGDB_URI);

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogListRouter);
app.use('/api/users', userRouter);

app.use(middleware.errorHandler);

module.exports = app;