const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => blog.likes + total, 0);
};

const favoriteBlog = (blogs) => {
  const returner = blogs.reduce((fave, blog) => {
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

  console.log(returner);

  return returner;
};

module.exports = {
  totalLikes,
  favoriteBlog
};