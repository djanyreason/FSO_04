const blogListRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const { userExtractor } = require('../utils/middleware');
const jwt = require('jsonwebtoken');

blogListRouter.get('/', async (request, response) => {
  response.json(await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 }));
});

blogListRouter.post('/', userExtractor, async (request, response) => {
  /*const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
*/
  const user = request.user;//await User.findById(decodedToken.id);

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author || 'Unknown',
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogListRouter.delete('/:id', userExtractor, async (request, response) => {
  /*const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  */
  const thisUser = request.user;//await User.findById(decodedToken.id.toString());

  if (thisUser.blogs
    .filter(aBlog => aBlog.toString() === request.params.id)
    .length
    === 0
  ) {
    return response.status(401).json({ error: 'incorrect user' });
  }

  await Blog.findByIdAndRemove(request.params.id);

  thisUser.blogs = thisUser.blogs.filter(aBlog => aBlog.toString() !== request.params.id);
  await thisUser.save();

  response.status(204).end();
});

blogListRouter.put('/:id', userExtractor, async (request, response) => {
  /*const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  */
  const thisUser = request.user;//await User.findById(decodedToken.id.toString());

  if (thisUser.blogs
    .filter(aBlog => aBlog.toString() === request.params.id)
    .length
    === 0
  ) {
    return response.status(401).json({ error: 'incorrect user' });
  }

  const blog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: thisUser._id
  };

  const savedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });

  response.json(savedBlog);
});

module.exports = blogListRouter;