const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => blog.likes + total, 0);
};

module.exports = {
  totalLikes
};