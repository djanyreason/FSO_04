const mongoose = require('mongoose');
const supertest = require('supertest');
const blogs = require('./blogListTestData');
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

afterAll(async () => {
  await mongoose.connection.close();
});