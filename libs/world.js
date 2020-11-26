const Turn = require('./turn')
const Field = require('./field')
const { customAlphabet } = require('nanoid')
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN
} = require('./constants')

class World {
  constructor () {
    this._states = []
  }

  /**
   * ワールドの作成（初期化処理）
   */
  create () {
    const id = World._generateNanoid(6)
    this._states.push({
      id,
      tokens: {
        [PLAYER_PEKORA]: '',
        [PLAYER_BAIKINKUN]: ''
      },
      turn: new Turn(),
      field: new Field(),
      words: [],
      baseWords: {
        [PLAYER_PEKORA]: null,
        [PLAYER_BAIKINKUN]: null
      },
      dealer: null
    })
    return id
  }

  /**
   * IDからワールドを探す
   *
   * @param {*} id
   */
  find (id) {
    return this._states.find(state => state.id === id)
  }

  /**
   * ワールドの削除
   *
   * @param {*} id
   */
  remove (id) {
    const idx = this._states.findIndex(state => state.id === id)
    if (idx === -1) return
    this._states.splice(idx, 1)
  }

  /**
   * 募集
   *
   * @param {*} id
   * @param {*} role
   */
  recruit (id, role) {
    const token = World._generateNanoid(12)
    const state = this.find(id)
    if (!state) throw new Error('world id not found exception')
    if (![PLAYER_PEKORA, PLAYER_BAIKINKUN].includes(role)) return null
    state.tokens[role] = token
    return token
  }

  /**
   * 参加
   *
   * @param {*} id
   */
  join (id) {
    const token = World._generateNanoid(12)
    const state = this.find(id)
    if (!state) throw new Error('world id not found exception')
    if (!state.tokens[PLAYER_PEKORA]) {
      state.tokens[PLAYER_PEKORA] = token
      return { role: PLAYER_PEKORA, token }
    }
    state.tokens[PLAYER_BAIKINKUN] = token
    return { role: PLAYER_BAIKINKUN, token }
  }

  /**
   * 正当なプレイヤーかどうかの検証
   *
   * @param {*} id
   * @param {*} token
   * @param {*} role
   */
  isValidPlayer (id, token, role) {
    const state = this.find(id)
    if (!state) return false
    if (state.tokens[role] === token) return true
    return false
  }

  /**
   * IDの生成
   *
   * @param {*} len
   */
  static _generateNanoid (len) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    const nanoid = customAlphabet(alphabet, len)
    return nanoid()
  }
}

module.exports = new World()
