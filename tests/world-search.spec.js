const request = require('supertest')
const server = require('../app')
const { PLAYER_PEKORA } = require('../libs/constants')

describe('world search api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/search').set('Authorization', `Bearer ${token}`).query({ page: 1, limit: 10 })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token}`).query({ role: PLAYER_PEKORA, isPublic: true })
      const res = await request(server).get('/api/v1/search').set('Authorization', `Bearer ${token}`).query({ page: 1, limit: 10 })
      expect(res.body).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        worlds: expect.any(Array)
      })
      expect(res.body.worlds[0]).toMatchObject({
        id: expect.any(String),
        role: expect.any(Number)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/search').set('Authorization', `Bearer ${token}`).query({ page: 1, limit: 21 })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/search').set('Authorization', `Bearer ${token}`).query({ page: 0, limit: 10 })
      expect(res.body).toMatchObject({
        msg: 'けんさくにしっぱいしました'
      })
    })
  })
})
