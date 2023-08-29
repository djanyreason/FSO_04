const blogListRouter = require('express').Router();
const Blog = require('../models/blog');

const User = require('../models/user');

blogListRouter.get('/', async (request, response) => {
  response.json(await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 }));
});

blogListRouter.post('/', async (request, response) => {
  const users = await User.find({});

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author || 'Unknown',
    url: request.body.url,
    likes: request.body.likes || 0,
    user: users[0]._id
  });

  const savedBlog = await blog.save();
  users[0].blogs = users[0].blogs.concat(savedBlog._id);
  await users[0].save();

  response.status(201).json(savedBlog);
});

blogListRouter.delete('/:id', async (request, response) => {
  const thisBlog = await Blog.findById(request.params.id);
  await Blog.findByIdAndRemove(request.params.id);

  if(thisBlog) {
    const thisUser = await User.findById(thisBlog.user.toString());

    console.log(thisUser.blogs.length);
    thisUser.blogs = thisUser.blogs.filter(aBlog => {
      console.log(aBlog.toString(), request.params.id, aBlog.toString() !== request.params.id);
      return aBlog.toString() !== request.params.id;
    });
    console.log(thisUser.blogs.length);
    await thisUser.save();
  }

  response.status(204).end();
});

blogListRouter.put('/:id', async (request, response) => {
  const users = await User.find({});

  const blog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: users[0]._id
  };

  const savedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });

  if(savedBlog) {
    if(users[0].blogs
      .filter(aBlog => aBlog.toString() === savedBlog._id.toString())
      .length === 0) {
      users[0].blogs = users[0].blogs.concat(savedBlog._id);
      await users[0].save();
    }
  }

  response.json(savedBlog);
});

module.exports = blogListRouter;