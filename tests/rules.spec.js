const request = require('supertest')
const server = require('../app')

describe('get rules api', () => {
  describe('normal', () => {
    test('status', async () => {
      const res = await request(server).get('/api/v1/rules')
      expect(res.statusCode).toBe(200)
    })
    test('body', async () => {
      const res = await request(server).get('/api/v1/rules')
      expect(res.body[0]).toMatchSnapshot({
        text: expect.any(String),
        image: expect.any(String)
      })
    })
  })
})
