const mongoose = require('mongoose');
const supertest = require('supertest');
const blogs = require('./blogListTestData');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});

  await Promise.all(blogs
    .map(blog => new Blog(blog))
    .map(blog => blog.save()));
});

test('all notes are returned', async () => {
  const response = await api
    .get('/api/blogs')
    .expect('Content-Type', /application\/json/);

  expect(response.body).toHaveLength(blogs.length);
});

test('has id parameter', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body[0].id).toBeDefined;
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Honestly One of the Weirdest Things I Have Ever Read',
    author: 'Ken Tremendous',
    url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html',
    likes: 2632
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const moreBlogs = await helper.blogsInDb();

  expect(moreBlogs).toHaveLength(blogs.length + 1);

  expect(moreBlogs.reduce((check, blog) => {
    return check
      ? check
      : (blog.title === newBlog.title)
        && (blog.author === newBlog.author)
        && (blog.url === newBlog.url)
        && (blog.likes === newBlog.likes);
  }, false)).toEqual(true);
});

afterAll(async () => {
  await mongoose.connection.close();
});