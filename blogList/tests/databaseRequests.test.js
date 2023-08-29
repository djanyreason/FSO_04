const mongoose = require('mongoose');
const supertest = require('supertest');
const testData = require('./blogListTestData');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

describe('testing user functionality', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    await Promise.all(testData.users
      .map(user => new User(user))
      .map(user => user.save()));
  });

  test('cannot add duplicate username', async () => {
    const newUser = {
      username: testData.users[0].username,
      name: 'Foo',
      password: 'Bar'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const userList = await helper.usersInDb();

    expect(userList).toHaveLength(testData.users.length);
  });

  test('cannot add short username', async () => {
    const newUser = {
      username: 'Pi',
      name: 'Foo',
      password: 'Bar'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const userList = await helper.usersInDb();

    expect(userList).toHaveLength(testData.users.length);
  });

  test('cannot add user without username', async () => {
    const newUser = {
      name: 'Foo',
      password: 'Bar'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const userList = await helper.usersInDb();

    expect(userList).toHaveLength(testData.users.length);
  });

  test('cannot add short password', async () => {
    const newUser = {
      username: 'Bar',
      name: 'Foo',
      password: 'Pi'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const userList = await helper.usersInDb();

    expect(userList).toHaveLength(testData.users.length);
  });

  test('cannot add user without password', async () => {
    const newUser = {
      name: 'Foo',
      username: 'Bar'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const userList = await helper.usersInDb();

    expect(userList).toHaveLength(testData.users.length);
  });
});

describe('testing blog functionality', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    await Promise.all(testData.blogs
      .map(blog => new Blog(blog))
      .map(blog => blog.save()));
  });

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(testData.blogs.length);
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

    expect(moreBlogs).toHaveLength(testData.blogs.length + 1);

    expect(moreBlogs.reduce((check, blog) => {
      return check
        ? check
        : (blog.title === newBlog.title)
          && (blog.author === newBlog.author)
          && (blog.url === newBlog.url)
          && (blog.likes === newBlog.likes);
    }, false)).toEqual(true);
  });

  test('a new blog without likes sets likes to 0', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html'
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length + 1);

    expect(moreBlogs.reduce((check, blog) => {
      return check
        ? check
        : (blog.title === newBlog.title)
          && (blog.author === newBlog.author)
          && (blog.url === newBlog.url)
          && (blog.likes === 0);
    }, false)).toEqual(true);
  });

  test('a new blog without title can\'t POST', async () => {
    const newBlog = {
      author: 'Ken Tremendous',
      url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html',
      likes: 2632
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length);
  });

  test('a new blog without URL can\'t POST', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      likes: 2632
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length);
  });

  test('deletion succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      testData.blogs.length - 1
    );

    const contents = blogsAtEnd.map(blog => blog.title);

    expect(contents).not.toContain(blogToDelete.title);
  });

  describe('updating blog likes', () => {
    test('update succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };

      const resultBlog = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      expect(blogsAtEnd.reduce((match, blog) =>
        match
          ? match
          : (blog.title === blogToUpdate.title
            ? blog
            : null)
      , null).likes).toEqual(updatedBlog.likes);
    });

    test('returns status code 200 and body null if ID does not exist', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };
      const validNonexistingId = await helper.nonExistingID();

      const result = await api
        .put(`/api/blogs/${validNonexistingId}`)
        .send(updatedBlog)
        .expect(200);

      expect(result.body).toEqual(null);
    });

    test('fails with statuscode 400 if id is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };
      const invalidId = '5a3d5da59070081a82a3445';

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updatedBlog)
        .expect(400);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});