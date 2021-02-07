const { customAlphabet } = require('nanoid')
const request = require('request')

class Helpers {
  /**
   * IDの生成
   *
   * @param {*} len
   */
  static generateId (len) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    const nanoid = customAlphabet(alphabet, len)
    return nanoid()
  }

  /**
   * yyyy/MM/dd HH:mm:ss形式でタイムスタンプを作成する
   */
  static getTimestamp () {
    const date = new Date()
    const yyyy = `${date.getFullYear()}`
    const MM = `0${date.getMonth() + 1}`.slice(-2)
    const dd = `0${date.getDate()}`.slice(-2)
    const HH = `0${date.getHours()}`.slice(-2)
    const mm = `0${date.getMinutes()}`.slice(-2)
    const ss = `0${date.getSeconds()}`.slice(-2)
    return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`
  }

  /**
   * イロレーティングの計算
   *
   * @param {*} ra
   * @param {*} rb
   */
  static calcEloRating (ra, rb, isWin = true, k = 32) {
    if (isWin) {
      const rate = 1 / (1 + Math.pow(10, ((rb - ra) / 400)))
      return Math.round(ra + k * (1 - rate))
    }
    const rate = 1 / (1 + Math.pow(10, ((ra - rb) / 400)))
    return Math.round(rb + k * (0 - rate))
  }

  /**
   * リクエストのラッパー
   */
  static request (options) {
    return new Promise((resolve, reject) => {
      request(options, (error, res, body) => {
        if (!error && res.statusCode === 200) {
          resolve(body)
        } else {
          reject(error)
        }
      })
    })
  }
}

module.exports = Helpers
