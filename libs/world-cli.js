const fetch = require('node-fetch')

require('dotenv').config()

const scheme = 'http'
const host = process.env.APP_HOST
const port = process.env.APP_PORT
const endpoint = '/api/v1/states'

const worldCli = async () => {
  const res = await fetch(`${scheme}://${host}:${port}${endpoint}`)
  const states = await res.json()
  for (const state of states) {
    console.log(state)
  }
}

worldCli()
