const { customAlphabet } = require('nanoid')

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
}

module.exports = Helpers
