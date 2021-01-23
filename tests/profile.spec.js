const request = require('supertest')
const server = require('../app')

describe('get profile api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/profile').set('Authorization', `Bearer ${token}`).query({ userId: 'foo' })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/profile').set('Authorization', `Bearer ${token}`).query({ userId: 'foo' })
      expect(res.body).toMatchObject({
        avatarId: expect.any(Number),
        avatar: expect.any(String),
        rate: expect.any(Number),
        rank: expect.any(String)
      })
      expect(res.body.history).toMatchObject({
        win: expect.any(Number),
        lose: expect.any(Number)
      })
    })
  })
})

describe('update profile api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).patch('/api/v1/profile').set('Authorization', `Bearer ${token}`).send({ avatarId: 2 })
      expect(res.statusCode).toBe(200)
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).patch('/api/v1/profile').set('Authorization', `Bearer ${token}`).send({ avatarId: 0 })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).patch('/api/v1/profile').set('Authorization', `Bearer ${token}`).send({ avatarId: 0 })
      expect(res.body).toMatchObject({
        msg: 'プロフィールのへんこうにしっぱいしました'
      })
    })
  })
})
