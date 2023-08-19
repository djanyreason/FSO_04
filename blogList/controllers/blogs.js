const blogListRouter = require('express').Router();
const Blog = require('../models/blog');

blogListRouter.get('/', async (request, response) => {
  response.json(await Blog.find({}));
});

blogListRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body);

  response.status(201).json(await blog.save());
});

module.exports = blogListRouter;