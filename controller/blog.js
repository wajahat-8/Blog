
const blogPostRouter=require('express').Router()
const { request, response } = require('../app')
const Blog=require('../model/blog')
blogPostRouter.get('/', async (request, response) => {
 const blogs= await Blog.find({})
  response.json(blogs)
})

blogPostRouter.post('/', async(request, response) => {
 
  const blog = new Blog(request.body)
  const newBlog= await blog.save()
   response.status(201).json(newBlog)
  

})
blogPostRouter.delete('/:id',async(request,response)=>{
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})
blogPostRouter.put('/:id',async(request,response,next)=>{
  const{title,author,url,likes}=request.body
  const blog=await Blog.findById(request.params.id)
  if(!blog){
    response.status(404).end()
  }
  blog.title=title
  blog.author=author
  blog.url=url
  blog.likes=likes
  const updatedBlog= await blog.save()
  response.json(updatedBlog)
})
module.exports=blogPostRouter