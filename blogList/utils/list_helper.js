const ArrayFunctions = require('./arrayFunctions');

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => blog.likes + total, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.reduce((fave, blog) => {
    return fave.likes > blog.likes ?
      fave :
      {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
      };
  }, {
    title: '',
    author: '',
    likes: 0
  });
};

const mostBlogs = (blogs) => {
  if(blogs.length === 0) {
    return {
      author: '',
      blogs: 0
    };
  }

  const authors = ArrayFunctions.reduceArray(
    ArrayFunctions.sortArray(
      blogs.map(blog => blog.author)
    )
  );

  return authors.reduce((prolific, thisAuthor) => {
    const blogCount = blogs.filter(blog => blog.author === thisAuthor).length;
    return blogCount > prolific.blogs ?
      {
        author: thisAuthor,
        blogs: blogCount
      } :
      prolific;
  }, {
    author: '',
    blogs: 0
  });
};

const mostLikes = (blogs) => {
  if(blogs.length === 0) {
    return {
      author: '',
      likes: 0
    };
  }

  const authors = ArrayFunctions.reduceArray(
    ArrayFunctions.sortArray(
      blogs.map(blog => blog.author)
    )
  );

  return authors.map(thisAuthor => {
    return {
      author: thisAuthor,
      likes: blogs.reduce((likeTotal, blog) => {
        return blog.author === thisAuthor ?
          likeTotal + blog.likes :
          likeTotal;
      }, 0)
    };})
    .reduce((mostLiked, thisAuthor) => {
      return thisAuthor.likes > mostLiked.likes ?
        thisAuthor :
        mostLiked;
    }, {
      author: '',
      likes: 0
    });
};

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};