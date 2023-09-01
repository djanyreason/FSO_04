const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const testData = require('./blog_list_test_data');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');


beforeEach(async () => {
  await User.deleteMany({});

  for(let user of testData.users) {
    const passHash = await bcrypt.hash(user.password, 10);
    const userObj = new User({
      name: user.name,
      username: user.username,
      passwordHash: passHash
    });
    await userObj.save();
  }

  const userArray = await User.find({});

  await Blog.deleteMany({});

  for(let blog of testData.blogs) {
    const blogObj = new Blog({
      ...blog,
      user: userArray[0]._id
    });
    const blogEntry = await blogObj.save();
    userArray[0].blogs = userArray[0].blogs.concat(blogEntry._id);
  }

  await userArray[0].save();
}, 100000);

describe('testing user functionality', () => {

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
  }, 100000);

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
  }, 100000);

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
  }, 100000);

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
  }, 100000);

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
  }, 100000);

  test('login succeeds with correct password', async () => {
    const credentials = {
      username: testData.users[0].username,
      password: testData.users[0].password
    };

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(200);

    expect(loginResponse.body.username).toEqual(testData.users[0].username);
    expect(loginResponse.body.name).toEqual(testData.users[0].name);
    expect(loginResponse.body.token).toBeDefined();
  }, 100000);

  test('login fails with incorrect password', async () => {
    const credentials = {
      username: testData.users[0].username,
      password: 'foo'
    };

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(401);
  }, 100000);

  test('login fails with unknown username', async () => {
    const credentials = {
      username: 'bar',
      password: 'foo'
    };

    const loginResponse = await api
      .post('/api/login')
      .send(credentials)
      .expect(401);
  }, 100000);
});

describe('testing adding and removing blogs', () => {

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(testData.blogs.length);
  }, 100000);

  test('has id parameter', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body[0].id).toBeDefined;
  }, 100000);

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html',
      likes: 2632
    };

    const userToken = await helper.getToken(testData.users[0]);

    await api
      .post('/api/blogs')
      .set('Authorization', userToken)
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
  }, 100000);

  test('a new blog has the correct user, and user object has blog', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html',
      likes: 2632
    };

    const userToken = await helper.getToken(testData.users[0]);

    await api
      .post('/api/blogs')
      .set('Authorization', userToken)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const moreBlogs = await helper.blogsInDb();
    const newBlogObj = moreBlogs.filter(blog =>
      blog.title === newBlog.title &&
      blog.author === newBlog.author &&
      blog.url === newBlog.url &&
      blog.likes === newBlog.likes)[0];

    const allUsers = await helper.usersInDb();
    const thisUser = allUsers.filter(user =>
      user.username === testData.users[0].username)[0];

    expect(newBlogObj.user.toString()).toEqual(thisUser.id);
    expect(thisUser.blogs.map(blog => blog.toString())).toContain(newBlogObj.id);
  }, 100000);

  test('a new blog without likes sets likes to 0', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html'
    };

    const userToken = await helper.getToken(testData.users[0]);

    await api
      .post('/api/blogs')
      .set('Authorization', userToken)
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
  }, 100000);

  test('a new blog without title can\'t POST', async () => {
    const newBlog = {
      author: 'Ken Tremendous',
      url: 'http://www.firejoemorgan.com/2008/01/honestly-one-of-weirdest-things-i-have.html',
      likes: 2632
    };

    const userToken = await helper.getToken(testData.users[0]);

    await api
      .post('/api/blogs')
      .set('Authorization', userToken)
      .send(newBlog)
      .expect(400);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length);
  }, 100000);

  test('a new blog without URL can\'t POST', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      likes: 2632
    };

    const userToken = await helper.getToken(testData.users[0]);

    await api
      .post('/api/blogs')
      .set('Authorization', userToken)
      .send(newBlog)
      .expect(400);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length);
  }, 100000);

  test('Cannot POST with an invalid token', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      likes: 2632
    };

    const userToken = await helper.getToken(testData.users[0]);

    const response = await api
      .post('/api/blogs')
      .set('Authorization', userToken.slice(0, 8) + userToken.slice(9, userToken.length))
      .send(newBlog)
      .expect(401);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length);
    expect(response.body.error).toEqual('invalid token');
  }, 100000);

  test('Cannot POST without a token', async () => {
    const newBlog = {
      title: 'Honestly One of the Weirdest Things I Have Ever Read',
      author: 'Ken Tremendous',
      likes: 2632
    };

    await api
      .post('/api/blogs')
      .set('Authorization', '')
      .send(newBlog)
      .expect(401);

    const moreBlogs = await helper.blogsInDb();

    expect(moreBlogs).toHaveLength(testData.blogs.length);
  }, 100000);

  test('deletion succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToDelete.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username === blogUsername)[0];

    const userToken = await helper.getToken(userCredentials);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', userToken)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      testData.blogs.length - 1
    );

    const contents = blogsAtEnd.map(blog => blog.title);

    expect(contents).not.toContain(blogToDelete.title);
  }, 100000);

  test('deletion succeeds with status code 204 if id is invalid', async () => {
    const userToken = await helper.getToken(testData.users[0]);
    const noID = await helper.nonExistingID();

    await api
      .delete(`/api/blogs/${noID}`)
      .set('Authorization', userToken)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      testData.blogs.length
    );
  }, 100000);

  test('deletion fails with status code 400 if id is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToDelete.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username === blogUsername)[0];

    const userToken = await helper.getToken(testData.users[0]);

    await api
      .delete('/api/blogs/6')
      .set('Authorization', userToken)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(testData.blogs.length);
  }, 100000);

  test('deletion fails with status code 401 if incorrect user', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToDelete.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username !== blogUsername)[0];

    const userToken = await helper.getToken(userCredentials);

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', userToken)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      testData.blogs.length
    );

    const contents = blogsAtEnd.map(blog => blog.title);

    expect(contents).toContain(blogToDelete.title);

    expect(response.body.error).toEqual('incorrect user');
  }, 100000);

  test('deletion fails with status code 401 if no token', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', '')
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      testData.blogs.length
    );

    const contents = blogsAtEnd.map(blog => blog.title);

    expect(contents).toContain(blogToDelete.title);
  }, 100000);

  test('deletion fails with status code 401 if token invalid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const userToken = await helper.getToken(testData.users[0]);

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', userToken.slice(0, 8) + userToken.slice(9, userToken.length))
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(
      testData.blogs.length
    );

    const contents = blogsAtEnd.map(blog => blog.title);

    expect(contents).toContain(blogToDelete.title);
    expect(response.body.error).toEqual('invalid token');
  }, 100000);
});

describe('updating blog likes', () => {
  test('update succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToUpdate.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username === blogUsername)[0];

    const userToken = await helper.getToken(userCredentials);

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', userToken)
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
  }, 100000);

  test('fails with status code 401 if incorrect user', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToUpdate.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username !== blogUsername)[0];

    const userToken = await helper.getToken(userCredentials);

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', userToken)
      .send(updatedBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd.filter(blog => {
      return blog.title === blogToUpdate.title &&
        blog.author === blogToUpdate.author &&
        blog.url === blogToUpdate.url &&
        blog.likes === (blogToUpdate.likes + 1);
    }).length).toEqual(0);
  }, 100000);

  test('returns status code 200 and body null if ID does not exist', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };
    const validNonexistingId = await helper.nonExistingID();

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToUpdate.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username === blogUsername)[0];

    const userToken = await helper.getToken(userCredentials);

    const result = await api
      .put(`/api/blogs/${validNonexistingId}`)
      .set('Authorization', userToken)
      .send(updatedBlog)
      .expect(200);

    expect(result.body).toEqual(null);
  }, 100000);

  test('fails with statuscode 400 if id is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };
    const invalidId = '5a3d5da59070081a82a3445';

    const usersAtStart = await helper.usersInDb();
    const blogUsername = usersAtStart.filter(user =>
      user.id === blogToUpdate.user.toString())[0].username;
    const userCredentials = testData.users.filter(user =>
      user.username !== blogUsername)[0];

    const userToken = await helper.getToken(userCredentials);

    await api
      .put(`/api/blogs/${invalidId}`)
      .set('Authorization', userToken)
      .send(updatedBlog)
      .expect(400);
  }, 100000);

  test('fails with status code 401 if no token', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', '')
      .send(updatedBlog)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd.filter(blog => {
      return blog.title === blogToUpdate.title &&
        blog.author === blogToUpdate.author &&
        blog.url === blogToUpdate.url &&
        blog.likes === (blogToUpdate.likes + 1);
    }).length).toEqual(0);
  }, 100000);

  test('fails with status code 401 if token invalid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = { ...blogToUpdate, likes: (blogToUpdate.likes + 1) };

    const userToken = await helper.getToken(testData.users[0]);

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', userToken.slice(0, 8) + userToken.slice(9, userToken.length))
      .send(updatedBlog)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd.filter(blog => {
      return blog.title === blogToUpdate.title &&
        blog.author === blogToUpdate.author &&
        blog.url === blogToUpdate.url &&
        blog.likes === (blogToUpdate.likes + 1);
    }).length).toEqual(0);
    expect(response.body.error).toEqual('invalid token');
  }, 100000);
});

afterAll(async () => {
  await mongoose.connection.close();
});