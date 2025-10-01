const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User=require('../model/user')

const api=supertest(app)
const initialUsers = [
  {
    username: 'root',
    name: 'Super User',
    password: 'secret123',   // plain text, will be hashed in test setup
  },
  {
    username: 'john',
    name: 'John Doe',
    password: 'mypassword',  // plain text, will be hashed in test setup
  }
]

beforeEach(async()=>{
  await   User.deleteMany({})
  await  User.insertMany(initialUsers)
})
describe('invalid user is not saved', () => {
  test('creation fails with short username', async () => {
    const newUser = {
      username: 'jo',   // too short
      name: 'Jo Short',
      password: 'validPassword123',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /is shorter than the minimum allowed length/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, initialUsers.length)
  })

  test('creation fails with short password', async () => {
    const newUser = {
      username: 'validuser',
      name: 'Valid Name',
      password: 'pw',   // too short
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /Password must be at least 3 characters long/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, initialUsers.length)
  })

  test('creation fails with missing password', async () => {
    const newUser = {
      username: 'anotheruser',
      name: 'No Password',
      // password missing
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /Password must be at least 3 characters long/)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, initialUsers.length)
  })
})
after(async () => {
  await mongoose.connection.close()
})