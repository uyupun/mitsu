const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const secretKey = crypto.randomBytes(256).toString('base64')

fs.writeFileSync(path.join(__dirname, '/../jwt_secret_key'), secretKey)
