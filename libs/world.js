const Field = require('./field')
const Turn = require('./turn')
const Word = require('./word')
const Helpers = require('./helpers')
const worldStatus = require('./world-status')
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN
} = require('./constants')

class World {
  constructor () {
    this._states = []
  }

  /**
   * ワールド情報のゲッター
   */
  get states () {
    const filteredStates = this._states.map((state) => {
      return {
        id: state.id,
        created_at: state.created_at,
        status: World._getStatusKey(state.status)
      }
    })
    return filteredStates
  }

  /**
   * WorldStatusのvalueからkeyの変換を行う
   *
   * @param {*} value
   */
  static _getStatusKey (value) {
    const statusKey = Object.keys(worldStatus).filter((key) => {
      if (worldStatus[key] === value) return key
      return null
    })[0]
    return statusKey
  }

  /**
   * ワールドの作成（初期化処理）
   */
  create () {
    const id = Helpers.generateId(6)
    this._states.push({
      id,
      tokens: {
        [PLAYER_PEKORA]: '',
        [PLAYER_BAIKINKUN]: ''
      },
      field: new Field(),
      turn: new Turn(),
      word: new Word(),
      dealer: null,
      created_at: Helpers.getTimestamp(),
      status: worldStatus.initialized
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
    const token = Helpers.generateId(12)
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
    const token = Helpers.generateId(12)
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
   * ステータスのセッター
   *
   * @param {*} id
   * @param {*} status
   */
  setStatus (id, status) {
    const state = this.find(id)
    if (!state) throw new Error('world is not found exception')
    const isValidStatus = Object.values(worldStatus).includes(status)
    if (!isValidStatus) throw new Error('status is invalid exception')
    state.status = status
  }

  /**
   * ステータスのゲッター
   */
  getStatus (id) {
    const state = this.find(id)
    if (!state) throw new Error('world is not found exception')
    return state.status
  }
}

module.exports = new World()