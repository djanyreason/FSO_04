const blogListRouter = require('express').Router();
const Blog = require('../models/blog');

blogListRouter.get('/', async (request, response) => {
  response.json(await Blog.find({}));
});

blogListRouter.post('/', (request, response) => {
  const blog = new Blog(request.body);

  blog
    .save()
    .then(result => {
      response.status(201).json(result);
    });
});

module.exports = blogListRouter;