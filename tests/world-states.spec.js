const request = require('supertest')
const server = require('../app')

describe('world states api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/states')
      expect(res.statusCode).toBe(200)
    })
    test('body (empty)', async () => {
      const res = await request(server).get('/api/v1/states')
      expect(res.body).toMatchObject([])
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token}`).query({ role: 1, isPublic: true })
      const res = await request(server).get('/api/v1/states')
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(String)
      })
    })
  })
})
