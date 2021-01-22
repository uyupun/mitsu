const request = require('supertest')
const server = require('../app')

describe('get skins api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/skins').set('Authorization', `Bearer ${token}`).query({ role: 1 })
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/skins').set('Authorization', `Bearer ${token}`).query({ role: 1 })
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String)
      })
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/skins').set('Authorization', `Bearer ${token}`).query({ role: 3 })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/skins').set('Authorization', `Bearer ${token}`).query({ role: 3 })
      expect(res.body).toMatchObject({
        msg: 'スキンのしゅとくにしっぱいしました'
      })
    })
  })
})

describe('update skins api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).patch('/api/v1/skins').set('Authorization', `Bearer ${token}`).send({ id: 2, role: 1 })
      expect(res.statusCode).toBe(200)
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).patch('/api/v1/skins').set('Authorization', `Bearer ${token}`).send({ id: 2, role: 3 })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).patch('/api/v1/skins').set('Authorization', `Bearer ${token}`).send({ id: 2, role: 3 })
      expect(res.body).toMatchObject({
        msg: 'スキンのへんこうにしっぱいしました'
      })
    })
  })
})
