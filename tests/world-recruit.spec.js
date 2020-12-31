const request = require('supertest')
const server = require('../app')
const { PLAYER_PEKORA } = require('../libs/constants')

describe('world recruit api', () => {
  describe('normal', () => {
    const req = {
      role: PLAYER_PEKORA,
      isPublic: true
    }
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token}`).query(req)
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token}`).query(req)
      expect(res.body).toMatchObject({
        worldId: expect.any(String),
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
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token}`).query(req)
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/recruit').set('Authorization', `Bearer ${token}`).query(req)
      expect(res.body).toMatchObject({
        msg: 'ぼしゅうにしっぱいしました'
      })
    })
  })
})
