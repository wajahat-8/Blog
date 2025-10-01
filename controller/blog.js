
const blogPostRouter=require('express').Router()
const { request, response } = require('../app')
const blog = require('../model/blog')
const Blog=require('../model/blog')
const User = require('../model/user')
const jwt=require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')
blogPostRouter.get('/', async (request, response) => {
 const blogs= await Blog.find({}).populate('user',{ username: 1, name: 1 })
  response.json(blogs)
})

blogPostRouter.post('/', userExtractor,async(request, response) => {
  const body=request.body

 const user=request.user
 if(!user){
  response.status(400).json({error:'userId missing or not valid'})
 }
  const blog = new Blog({
    title:body.title,
    author:body.author,
    url:body.url,
    likes:body.likes,
    user: user._id 
  })
  const newBlog= await blog.save()
  
  user.blogs=user.blogs.concat(newBlog._id)
  await user.save()
   response.status(201).json(newBlog)
  

})
blogPostRouter.delete('/:id',userExtractor,async(request,response)=>{
  const user=request.user

  const blog= await Blog.findById(request.params.id)
  if(!blog){
    return response.status(404).json({ error: 'blog not found' })
  }
  if(blog.user.toString()!==user.id.toString()){
    return response.status(401).json({ error: 'not authorized to delete this blog' })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})
blogPostRouter.put('/:id',async(request,response)=>{
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