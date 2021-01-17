const request = require('supertest')
const server = require('../app')

describe('get ranks api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/ranks').set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).get('/api/v1/ranks').set('Authorization', `Bearer ${token}`)
      expect(res.body[0]).toMatchObject({
        name: expect.any(String),
        image: expect.any(String)
      })
      expect(res.body[0].rate).toMatchObject({
        lower: expect.any(Number),
        upper: expect.any(Number)
      })
    })
  })
})
