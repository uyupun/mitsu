const request = require('supertest')
const server = require('../app')

describe('rules get api', () => {
  describe('normal', () => {
    test('', async () => {
      const res = await request(server).get('/api/v1/rules')
      expect(res.statusCode).toBe(200)
    })
  })
})
