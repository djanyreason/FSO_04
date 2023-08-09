const blogs = require('./blogListTestData');
const listHelper = require('../utils/list_helper');

describe('total likes', () => {
  let blogsTotalLikes = 0;

  for(let blog of blogs) {
    blogsTotalLikes += blog.likes;
  }

  test('of empty list is zero',
    () => expect(listHelper.totalLikes([])).toBe(0));

  test('when list has only one blog equals the likes of that',
    () => expect(listHelper.totalLikes(blogs.slice(0,1)))
      .toBe(blogs[0].likes));

  test('of a bigger list is calculated right',
    () => expect(listHelper.totalLikes(blogs)).toBe(blogsTotalLikes));
});