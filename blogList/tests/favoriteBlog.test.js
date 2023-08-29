const { blogs } = require('./blogListTestData');
const listHelper = require('../utils/list_helper');

describe('favorite blog', () => {
  test('of empty list is blank',
    () => expect(listHelper.favoriteBlog([])).toEqual({
      title: '',
      author: '',
      likes: 0
    }));

  test('when list has only one blog returns that',
    () => expect(listHelper.favoriteBlog(blogs.slice(0,1)))
      .toEqual({
        title: blogs[0].title,
        author: blogs[0].author,
        likes: blogs[0].likes
      }));

  let maxLikes = 0;

  for(let blog of blogs) {
    maxLikes = Math.max(maxLikes, blog.likes);
  }

  const favBlog = listHelper.favoriteBlog(blogs);

  test('of a bigger list is calculated right',
    () => expect(
      favBlog.likes === maxLikes &&
      blogs.filter(blog =>
        blog.title === favBlog.title &&
        blog.author === favBlog.author &&
        blog.likes === favBlog.likes
      ).length > 0)
      .toBe(true));

  const extraBlogs = blogs.concat({
    title: 'Test Tied Title',
    author: 'Test Tied Author',
    likes: maxLikes
  });

  const extraFavBlog = listHelper.favoriteBlog(extraBlogs);

  test('of a list with multiple tied faves returns correctly',
    () => expect(
      extraFavBlog.likes === maxLikes &&
      extraBlogs.filter(blog =>
        blog.title === extraFavBlog.title &&
        blog.author === extraFavBlog.author &&
        blog.likes === extraFavBlog.likes
      ).length > 0)
      .toBe(true));
});

describe('most prolific author', () => {
  test('of empty list is blank',
    () => expect(listHelper.mostBlogs([])).toEqual({
      author: '',
      blogs: 0
    }));

  test('when list has only one blog returns its author with 1 blog',
    () => expect(listHelper.mostBlogs(blogs.slice(0,1)))
      .toEqual({
        author: blogs[0].author,
        blogs: 1
      }));

  test('of a bigger list is calculated right',
    () => expect(listHelper.mostBlogs(blogs))
      .toEqual({
        author: 'Robert C. Martin',
        blogs: 3
      }));

  const extraProlificBlogs = listHelper.mostBlogs(blogs.concat({
    title: 'Test Tied Title',
    author: 'Edsger W. Dijkstra',
    likes: 0
  }));

  test('of a list with multiple tied faves returns correctly',
    () => expect(
      extraProlificBlogs.blogs === 3 &&
      (extraProlificBlogs.author === 'Edsger W. Dijkstra' ||
      extraProlificBlogs.author === 'Robert C. Martin'))
      .toBe(true));
});

describe('most liked author', () => {
  test('of empty list is blank',
    () => expect(listHelper.mostLikes([])).toEqual({
      author: '',
      likes: 0
    }));

  test('when list has only one blog returns its author with blog\'s likes',
    () => expect(listHelper.mostLikes(blogs.slice(0,1)))
      .toEqual({
        author: blogs[0].author,
        likes: blogs[0].likes
      }));

  test('of a bigger list is calculated right',
    () => expect(listHelper.mostLikes(blogs))
      .toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 17
      }));

  const extraProlificBlogs = listHelper.mostLikes(blogs.concat({
    title: 'Test Tied Title',
    author: 'Robert C. Martin',
    likes: 5
  }));

  test('of a list with multiple tied faves returns correctly',
    () => expect(
      extraProlificBlogs.likes === 17 &&
      (extraProlificBlogs.author === 'Edsger W. Dijkstra' ||
      extraProlificBlogs.author === 'Robert C. Martin'))
      .toBe(true));
});