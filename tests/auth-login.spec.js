const request = require('supertest')
const server = require('../app')

describe('auth login api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const res = await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })
      expect(res.body).toMatchObject({
        token: expect.any(String)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const res = await request(server).post('/api/v1/login').send({ userId: '', password: 'password' })
      expect(res.statusCode).toBe(400)
    })
    test('body (empty user id)', async () => {
      const res = await request(server).post('/api/v1/login').send({ userId: '', password: 'password' })
      expect(res.body).toMatchObject({
        msg: 'ログインにしっぱいしました'
      })
    })
  })
})
