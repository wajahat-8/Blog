const _ = require('lodash');
const dummy = (blogs) => {
  return 1
}
const totalLikes=(listOfBlogs)=>{
  const reducer=(sum,item)=>{
     return sum+item.likes
  }
  return listOfBlogs.reduce(reducer,0)

}
const favoriteBlog = (listOfBlogs) => {
  return listOfBlogs.reduce((max, blog) => 
    max.likes > blog.likes ? max : blog
  ).likes
}
// const mostBlogs=(listOfBlogs)=>{
//   const authorCount={}
//   listOfBlogs.forEach(blog=> {
//       authorCount[blog.author]=(authorCount[blog.author]||0)+1;
    
//   });
//   let topAuthor=null;
//   let maxBlog=0;
//   for(const author in authorCount){
//     if(authorCount[author]>maxBlog){
//       topAuthor=author
//       maxBlog=authorCount[author]
//     }
//   }
//   return topAuthor

// }

const mostBlogs = (listOfBlogs) => {
  if (!listOfBlogs.length) return null;

  // 1. Group blogs by author
  // 2. Map to an array of { author, blogs }
  // 3. Find the object with the maximum blogs
  // 4. Return only the author name
  const topAuthorObj = _.maxBy(
    _.map(_.groupBy(listOfBlogs, 'author'), (blogs, author) => ({
      author,
      blogs: blogs.length
    })),
    'blogs'
  );

  return topAuthorObj;
};
// const mostLikes=(listOfBlogs)=>{
//   let maxBlog=listOfBlogs[0];
//   listOfBlogs.forEach(blog => {
//     if(blog.likes>maxBlog.likes){
//       maxBlog=blog
//     }
    
//   });
//   return {
//     author:maxBlog.author,
//     likes:maxBlog.likes
//   }
// }
const mostLikes = (listOfBlogs) => {
  if (listOfBlogs.length === 0) return null;

  const maxBlog = _.maxBy(listOfBlogs, 'likes');

  return {
    title: maxBlog.title,
    likes: maxBlog.likes
  };
};

module.exports = {
  dummy,totalLikes,favoriteBlog,mostBlogs,mostLikes
}