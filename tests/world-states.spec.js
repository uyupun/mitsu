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
      await request(server).get('/api/v1/recruit').query({ recruit: 1 })
      const res = await request(server).get('/api/v1/states')
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(String)
      })
    })
  })
})
