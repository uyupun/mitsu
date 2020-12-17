const request = require('supertest')
const server = require('../app')

describe('world recruit api', () => {
  describe('normal', () => {
    const req = {
      role: 1,
      isPublic: true
    }
    test('status', async () => {
      const res = await request(server).get('/api/v1/recruit').query(req)
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/recruit').query(req)
      expect(res.body).toMatchObject({
        worldId: expect.any(String),
        token: expect.any(String),
        role: expect.any(Number)
      })
    })
  })
  describe('exception', () => {
    const req = {
      role: 3,
      isPublic: true
    }
    test('status', async () => {
      const res = await request(server).get('/api/v1/recruit').query(req)
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/recruit').query(req)
      expect(res.body).toMatchObject({
        msg: 'ぼしゅうにしっぱいしました'
      })
    })
  })
})
