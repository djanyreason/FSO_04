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

module.exports = {
  blogsInDb, usersInDb, nonExistingID
};