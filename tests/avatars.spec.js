const request = require('supertest')
const server = require('../app')

describe('get avatars api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/avatars').set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/avatars').set('Authorization', `Bearer ${token}`)
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String)
      })
    })
  })
})
