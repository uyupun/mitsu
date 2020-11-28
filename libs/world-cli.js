const fetch = require('node-fetch')
const Table = require('cli-table3')

require('dotenv').config()

const scheme = 'http'
const host = process.env.APP_HOST
const port = process.env.APP_PORT
const endpoint = '/api/v1/states'

const worldCli = async () => {
  const table = new Table({
    head: ['ID', 'Status', 'CreatedAt'],
    colWidths: [10, 20, 30]
  })

  const res = await fetch(`${scheme}://${host}:${port}${endpoint}`)
  const states = await res.json()
  for (const state of states) {
    table.push([
      state.id, state.status, state.created_at
    ])
  }
  console.log(table.toString())
}

worldCli()
