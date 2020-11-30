const request = require('supertest')
const server = require('../app')

describe('world recruit api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/recruit').query({ recruit: 1 })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/recruit').query({ recruit: 1 })
      expect(res.body).toMatchObject({
        worldId: expect.any(String),
        token: expect.any(String),
        role: expect.any(Number)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/recruit').query({ recruit: 3 })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/recruit').query({ recruit: 3 })
      expect(res.body).toMatchObject({
        msg: 'ぼしゅうにしっぱいしました'
      })
    })
  })
})
