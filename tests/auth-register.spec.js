const request = require('supertest')
const server = require('../app')

const generateUserId = () => {
  return Math.random().toString(32).substring(2)
}

describe('auth register api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).post('/api/v1/register').send({ userId: generateUserId(), password: 'password' })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const res = await request(server).post('/api/v1/register').send({ userId: generateUserId(), password: 'password' })
      expect(res.body).toMatchObject({
        token: expect.any(String)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const res = await request(server).post('/api/v1/register').send({ userId: '', password: 'password' })
      expect(res.statusCode).toBe(400)
    })
    test('body (empty user id)', async () => {
      const res = await request(server).post('/api/v1/register').send({ userId: '', password: 'password' })
      expect(res.body).toMatchObject({
        msg: expect.any(String)
      })
    })
    test('body (already registerd user id)', async () => {
      const res = await request(server).post('/api/v1/register').send({ userId: 'foo', password: 'password' })
      expect(res.body).toMatchObject({
        msg: expect.any(String)
      })
    })
  })
})
