const blogs = require('./blogListTestData');
const listHelper = require('../utils/list_helper');

describe('total likes', () => {
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

  test('of a list with multiple tied faves',
    () => expect(
      extraFavBlog.likes === maxLikes &&
      extraBlogs.filter(blog =>
        blog.title === extraFavBlog.title &&
        blog.author === extraFavBlog.author &&
        blog.likes === extraFavBlog.likes
      ).length > 0)
      .toBe(true));
});