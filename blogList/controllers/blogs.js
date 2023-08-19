const blogListRouter = require('express').Router();
const Blog = require('../models/blog');

blogListRouter.get('/', async (request, response) => {
  response.json(await Blog.find({}));
});

blogListRouter.post('/', async (request, response) => {
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author || 'Unknown',
    url: request.body.url,
    likes: request.body.likes || 0
  });

  response.status(201).json(await blog.save());
});

module.exports = blogListRouter;