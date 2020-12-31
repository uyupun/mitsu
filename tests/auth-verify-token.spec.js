const request = require('supertest')
const server = require('../app')

describe('verify token', () => {
  describe('exception', () => {
    test('status (400)', async () => {
      const res = await request(server).get('/api/v1/rules')
      expect(res.statusCode).toBe(400)
    })
    test('status (401)', async () => {
      const res = await request(server).get('/api/v1/rules').set('Authorization', 'Bearer hoge')
      expect(res.statusCode).toBe(401)
    })
    test('body (400)', async () => {
      const res = await request(server).get('/api/v1/rules')
      expect(res.body).toMatchObject({})
    })
    test('body (401)', async () => {
      const res = await request(server).get('/api/v1/rules').set('Authorization', 'Bearer hoge')
      expect(res.body).toMatchObject({})
    })
  })
})
