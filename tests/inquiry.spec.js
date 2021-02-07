const request = require('supertest')
const server = require('../app')

describe('inquiry api', () => {
  describe('normal', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).post('/api/v1/inquiry').set('Authorization', `Bearer ${token}`).send({
        content: 'content',
        email: 'example@example.com',
        categoryId: 1
      })
      expect(res.statusCode).toBe(200)
    })
  })
  describe('exception', () => {
    test('status', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).post('/api/v1/inquiry').set('Authorization', `Bearer ${token}`).send({
        content: '',
        email: 'example@example.com',
        categoryId: 1
      })
      expect(res.statusCode).toBe(400)
    })
    test('body', async () => {
      const token = (await request(server).post('/api/v1/login').send({ userId: 'foo', password: 'password' })).body.token
      const res = await request(server).post('/api/v1/inquiry').set('Authorization', `Bearer ${token}`).send({
        content: '',
        email: 'example@example.com',
        categoryId: 1
      })
      expect(res.body).toMatchObject({
        msg: 'おといあわせにしっぱいしました'
      })
    })
  })
})
