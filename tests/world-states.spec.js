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
      expect(res.body).toMatchSnapshot([])
    })
    test('body', async () => {
      await request(server).get('/api/v1/recruit').query({ recruit: 1 })
      const res = await request(server).get('/api/v1/states')
      expect(res.body[0]).toMatchSnapshot({
        id: expect.any(String),
        status: expect.any(String),
        created_at: expect.any(String)
      })
    })
  })
})
