const Field = require('./field')
const Turn = require('./turn')
const Word = require('./word')
const Helpers = require('./helpers')
const worldStatus = require('./world-status')
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN
} = require('./constants')
const auth = require('./auth')

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
        createdAt: state.createdAt,
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
  create (isPublic) {
    const id = Helpers.generateId(6)
    this._states.push({
      id,
      players: {
        [PLAYER_PEKORA]: '',
        [PLAYER_BAIKINKUN]: ''
      },
      field: new Field(),
      turn: new Turn(),
      word: new Word(),
      dealer: null,
      createdAt: Helpers.getTimestamp(),
      status: worldStatus.initialized,
      isPublic
    })
    return id
  }

  /**
   * IDからワールドを探す
   *
   * @param {*} id
   */
  find (id) {
    return this._states.find((state) => state.id === id)
  }

  /**
   * ワールドの削除
   *
   * @param {*} id
   */
  remove (id) {
    const idx = this._states.findIndex((state) => state.id === id)
    if (idx === -1) return
    this._states.splice(idx, 1)
  }

  /**
   * 募集
   *
   * @param {*} worldId
   * @param {*} role
   * @param {*} userId
   */
  recruit (worldId, role, userId) {
    const state = this.find(worldId)
    if (!state) throw new Error('world id not found exception')
    if (![PLAYER_PEKORA, PLAYER_BAIKINKUN].includes(role)) throw new Error('player role not found exception')
    state.players[role] = userId
  }

  /**
   * 参加
   *
   * @param {*} worldId
   * @param {*} userId
   */
  join (worldId, userId) {
    const state = this.find(worldId)
    if (!state) throw new Error('world id not found exception')
    if (!state.players[PLAYER_PEKORA]) {
      state.players[PLAYER_PEKORA] = userId
      return PLAYER_PEKORA
    }
    state.players[PLAYER_BAIKINKUN] = userId
    return PLAYER_BAIKINKUN
  }

  /**
   * 正当なプレイヤーかどうかの検証
   *
   * @param {*} id
   * @param {*} token
   * @param {*} role
   */
  isValidPlayer (id, token, role) {
    let isValid = false
    auth.verifyToken(token, (err, decoded) => {
      if (err) return
      const userId = auth.getTokenPayload(token).userId
      const state = this.find(id)
      if (!state) return
      if (state.players[role] !== userId) return
      isValid = true
    })
    return isValid
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

  /**
   * 公開されたワールドの検索
   */
  fetch (inverse = false) {
    const filteredStates = this._states.filter((state) => (
      state.isPublic && (state.status === worldStatus.initialized || state.status === worldStatus.waiting)
    ))
    return inverse ? filteredStates.reverse() : filteredStates
  }

  /**
   * ワールド検索結果を元にページネーションに必要な値を返す
   */
  paginate (page, limit) {
    const states = this.fetch(true)
    const worlds = []
    const index = (page - 1) * limit
    if (states.length > index) {
      const endIndex = states.length <= index + limit ? states.length : index + limit
      const slicedStates = states.slice(index, endIndex)
      slicedStates.forEach((state) => {
        worlds.push({
          id: state.id,
          role: state.tokens[PLAYER_PEKORA] ? PLAYER_BAIKINKUN : PLAYER_PEKORA
        })
      })
    }
    return { page, limit, total: states.length, worlds }
  }
}

module.exports = new World()
