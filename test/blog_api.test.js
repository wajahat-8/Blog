const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")

const app = require('../app')
const Blog = require('../model/blog')
const User = require('../model/user')
const helper = require('./test_helper') // Assuming initialBlogs is moved to a helper file

const api = supertest(app)

// This token will be set in beforeEach and used by tests that need authentication
let token = null
let testUserId = null

beforeEach(async () => {
  // Clear the database
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create a single test user
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Root User', passwordHash })
  const savedUser = await user.save()
  testUserId = savedUser._id

  // Associate initial blogs with the test user
  const blogsWithOwner = helper.initialBlogs.map(blog => ({ ...blog, user: savedUser._id }))
  await Blog.insertMany(blogsWithOwner)

  // FIX: Correctly sign a JWT for the test user
  const userForToken = { username: savedUser.username, id: savedUser._id }
  token = jwt.sign(userForToken, process.env.SECRET)
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert('id' in blog)
      assert(!('_id' in blog))
    })
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data and a valid token', async () => {
    const newBlog = {
      title: 'A new blog for testing',
      author: 'Test Author',
      url: 'https://example.com/test',
      likes: 15
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // FIX: Auth header is required
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('A new blog for testing'))
  })

  test('fails with status code 401 if a token is not provided', async () => {
    const newBlog = {
      title: 'This should not be added',
      author: 'No One',
      url: 'https://example.com/not-added'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401) // NEW: Test for unauthorized access

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Default Author',
      url: 'https://example.com/no-likes'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // FIX: Auth header is required
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('fails with status code 400 if title is missing', async () => {
    const blogWithoutTitle = {
      author: 'Nameless Author',
      url: 'https://example.com/no-title'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // FIX: Auth header is required
      .send(blogWithoutTitle)
      .expect(400) // Bad Request
  })

  test('fails with status code 400 if url is missing', async () => {
    const blogWithoutUrl = {
      title: 'Blog with no destination',
      author: 'Lost Author'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // FIX: Auth header is required
      .send(blogWithoutUrl)
      .expect(400) // Bad Request
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status 204 if id is valid and user is the owner', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0] // This blog was created by our test user

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`) // FIX: Auth header is required
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(!titles.includes(blogToDelete.title))
  })
})

describe('updating a blog', () => {
  test('succeeds in updating the likes of a blog post', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      likes: blogToUpdate.likes + 100
    }

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)

    assert.strictEqual(result.body.likes, blogToUpdate.likes + 100)
  })
})

after(async () => {
  await mongoose.connection.close()
})