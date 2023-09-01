const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

const nonExistingID = async () => {
  const blog = new Blog({ title: 'title', url: 'url' });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const getToken = async (user) => {
  const loginResponse = await api
    .post('/api/login')
    .send({ username: user.username,
      password: user.password });

  return 'Bearer ' + loginResponse.body.token;
};

module.exports = {
  blogsInDb, usersInDb, nonExistingID, getToken
};