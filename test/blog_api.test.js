const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog=require('../model/blog')
const blog = require('../model/blog')

const api=supertest(app)
 const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]
beforeEach(async()=>{
    await Blog.deleteMany({})
    await Blog.insertMany(blogs)
})
test('all notes are returned',async()=>{
    const response= await api.get('/api/blogs') 
   .expect(200)
   .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length,blogs.length)
   
})
test('all blogs have id property',async()=>{
  const response=await api.get('/api/blogs')
  .expect(200)
  .expect('Content-Type', /application\/json/)
  response.body.forEach(blog=>{
   assert.ok(blog.id )
  })

})
test ('blog is valid'),async()=>{
  const testBlog={
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  }
  await api
  .post('/api/blogs')
  .send(testBlog)
  .expect(400)
  assert.strictEqual(blogs.length,blogs.length+1)

}
test('blog without likes defaults to 0 ',async()=>{
  const testBlog={
    
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
   
  }
  const response=await api
  .post('/api/blogs')
  .send(testBlog)
  .expect(201)
  assert.strictEqual(response.body.likes,0)
})
test('blog with missing something ',async()=>{
  const testBlog={
    
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra"
   
  }
  const response=await api
  .post('/api/blogs')
  .send(testBlog)
  assert.strictEqual(blogs.length,blogs.length)
  
})
describe('deletion of a note',()=>{
  test('succeeds with status code 204 if id is valid',async()=>{
    const blogsAtStart = await Blog.find({})
    const blogToDelete=blogsAtStart[0]
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)
    const blogsAtend = await Blog.find({})
    const title=blogsAtend.map(n=>n.title)
    assert(!title.includes(blogToDelete.title))
     
    assert.strictEqual(blogsAtend.length,blogsAtStart.length-1)

  })
})
describe('updating a blog',()=>{
  test.only('succed if blog is updates',async()=>{
    const blogsAtStart=await Blog.find({})
    const blogToUpdate=blogsAtStart[0]
   const updatedLikes={   _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",likes:999}
    const result=await api.put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedLikes)
    .expect(200)
    .expect('Content-Type', /application\/json/)
     assert.strictEqual(result.body.likes, updatedLikes.likes)

  })
})
after(async () => {
  await mongoose.connection.close()
})