const request = require('supertest')
const server = require('../app')

describe('world search api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/search').query({ page: 1, limit: 10 })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      await request(server).get('/api/v1/recruit').query({ role: 1, isPublic: true })
      const res = await request(server).get('/api/v1/search').query({ page: 1, limit: 10 })
      expect(res.body).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        list: expect.any(Array)
      })
      expect(res.body.list[0]).toMatchObject({
        worldId: expect.any(String),
        role: expect.any(Number)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/search').query({ page: 1, limit: 21 })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/search').query({ page: 0, limit: 10 })
      expect(res.body).toMatchObject({
        msg: 'けんさくにしっぱいしました'
      })
    })
  })
})
