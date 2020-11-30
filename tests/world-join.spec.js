const request = require('supertest')
const server = require('../app')

describe('world join api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/join').query({ worldId: 'xxxxxx' })
      expect(res.statusCode).toBe(200)
    })
    test('body (validity: true)', async () => {
      const recruit = await request(server).get('/api/v1/recruit').query({ recruit: 1 })
      const worldId = await recruit.body.worldId
      const res = await request(server).get('/api/v1/join').query({ worldId })
      expect(res.body).toMatchSnapshot({
        validity: true,
        token: expect.any(String),
        role: expect.any(Number)
      })
    })
    test('body (validity: false)', async () => {
      const res = await request(server).get('/api/v1/join').query({ worldId: 'xxxxxx' })
      expect(res.body).toMatchSnapshot({
        validity: false,
        token: expect.any(Object),
        role: expect.any(Object)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/join').query({ worldId: '' })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/join').query({ worldId: '' })
      expect(res.body).toMatchSnapshot({
        msg: 'さんかにしっぱいしました'
      })
    })
  })
})
