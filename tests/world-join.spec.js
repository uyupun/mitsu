const request = require('supertest')
const server = require('../app')
const { PLAYER_PEKORA } = require('../libs/constants')

describe('world join api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token1 = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const token2 = (await request(server).post('/api/v1/login').send({ userId: 'bar', password: 'password' })).body.token
      const worldId = (await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token1}`).query({ role: PLAYER_PEKORA, isPublic: true })).body.worldId
      const res = await request(server).get('/api/v1/join').set('Authorization', `Bearer ${token2}`).query({ worldId })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token1 = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const token2 = (await request(server).post('/api/v1/login').send({ userId: 'bar', password: 'password' })).body.token
      const worldId = (await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token1}`).query({ role: PLAYER_PEKORA, isPublic: true })).body.worldId
      const res = await request(server).get('/api/v1/join').set('Authorization', `Bearer ${token2}`).query({ worldId })
      expect(res.body).toMatchObject({
        role: expect.any(Number)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/join').set('Authorization', `Bearer ${token}`).query({ worldId: '' })
      expect(res.statusCode).toBe(400)
    })
    test('body (empty world id)', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/join').set('Authorization', `Bearer ${token}`).query({ worldId: '' })
      expect(res.body).toMatchObject({
        msg: 'さんかにしっぱいしました'
      })
    })
    test('body (invalid world id)', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/join').set('Authorization', `Bearer ${token}`).query({ worldId: 'xxxxxx' })
      expect(res.body).toMatchObject({
        msg: 'さんかにしっぱいしました'
      })
    })
  })
})
