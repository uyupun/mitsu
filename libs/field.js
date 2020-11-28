const {
  FIELD_HEIGHT,
  PLAYER_MOVABLE_FIELD_WIDTH,
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN,
  PLAYER_PEKORA_START_POSITION_X,
  PLAYER_PEKORA_START_POSITION_Y,
  PLAYER_BAIKINKUN_START_POSITION_X,
  PLAYER_BAIKINKUN_START_POSITION_Y,
  SOCIAL_DISTANCE_ZONE_RADIUS,
  PLAYER_MOVE_SCALE
} = require('./constants')

class Field {
  constructor () {
    this._positions = {
      [PLAYER_PEKORA]: {
        x: PLAYER_PEKORA_START_POSITION_X,
        y: PLAYER_PEKORA_START_POSITION_Y
      },
      [PLAYER_BAIKINKUN]: {
        x: PLAYER_BAIKINKUN_START_POSITION_X,
        y: PLAYER_BAIKINKUN_START_POSITION_Y
      }
    }
  }

  /**
   * ポジション情報のゲッター
   *
   * @param {*} role
   */
  getPositions (role) {
    if (!Field._isValidPlayerRole(role)) throw new Error('player role is not found exception')
    return this._positions[role]
  }

  /**
   * プレイヤーの移動
   *
   * @param {*} role
   * @param {*} x
   * @param {*} y
   */
  move (role, x, y) {
    if (!Field._isValidPlayerRole(role)) throw new Error('player role is not found exception')
    const newX = Field._correctPositionX(
      this._positions[role].x + x * PLAYER_MOVE_SCALE
    )
    const newY = Field._correctPositionY(
      this._positions[role].y + y * PLAYER_MOVE_SCALE
    )
    this._positions[role] = {
      x: newX,
      y: newY
    }
  }

  /**
   * プレイヤーがワールドからはみ出していたらはみ出さないように補正する(x座標)
   *
   * @param {*} x
   */
  static _correctPositionX (x) {
    // xのマイナス方向の限界値を超えていないか
    if (x < SOCIAL_DISTANCE_ZONE_RADIUS) x = SOCIAL_DISTANCE_ZONE_RADIUS
    // xのプラス方向の限界値を超えていないか
    else if (x > PLAYER_MOVABLE_FIELD_WIDTH - SOCIAL_DISTANCE_ZONE_RADIUS) x = PLAYER_MOVABLE_FIELD_WIDTH - SOCIAL_DISTANCE_ZONE_RADIUS
    return x
  }

  /**
   * プレイヤーがワールドからはみ出していたらはみ出さないように補正する(y座標)
   *
   * @param {*} y
   */
  static _correctPositionY (y) {
    // yのマイナス方向の限界値を超えていないか
    if (y < SOCIAL_DISTANCE_ZONE_RADIUS) y = SOCIAL_DISTANCE_ZONE_RADIUS
    // yのプラス方向の限界値を超えていないか
    else if (y > FIELD_HEIGHT - SOCIAL_DISTANCE_ZONE_RADIUS) y = FIELD_HEIGHT - SOCIAL_DISTANCE_ZONE_RADIUS
    return y
  }

  /**
   * プレイヤーのロールが正当かどうか
   *
   * @param {*} role
   */
  static _isValidPlayerRole (role) {
    if ([PLAYER_PEKORA, PLAYER_BAIKINKUN].includes(role)) return true
    return false
  }
}

module.exports = Field
