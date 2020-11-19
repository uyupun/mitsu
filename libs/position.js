const {
  FIELD_HEIGHT,
  SOCIAL_DISTANCE_ZONE_RADIUS,
  PLAYER_MOVE_SCALE,
  PLAYER_MOVABLE_FIELD_WIDTH
} = require('./constants')

class Position {
  /**
   * ２回目以降のポジションx, yを返す
   *
   * @param {*} x
   * @param {*} y
   * @param {*} word
   */
  depart (x, y, word) {
    const newX = this._correctPositionX(
      x + word.move_x * PLAYER_MOVE_SCALE
    )
    const newY = this._correctPositionY(
      y + word.move_y * PLAYER_MOVE_SCALE
    )
    return { x: newX, y: newY }
  }

  /**
   * プレイヤーがワールドからはみ出していたらはみ出さないように補正する(x座標)
   *
   * @param {*} x
   */
  _correctPositionX (x) {
    // xのマイナス方向の限界値を超えていないか
    if (x < SOCIAL_DISTANCE_ZONE_RADIUS) x = SOCIAL_DISTANCE_ZONE_RADIUS
    // xのプラス方向の限界値を超えていないか
    else if (x > PLAYER_MOVABLE_FIELD_WIDTH - SOCIAL_DISTANCE_ZONE_RADIUS) { x = PLAYER_MOVABLE_FIELD_WIDTH - SOCIAL_DISTANCE_ZONE_RADIUS }
    return x
  }

  /**
   * プレイヤーがワールドからはみ出していたらはみ出さないように補正する(y座標)
   *
   * @param {*} y
   */
  _correctPositionY (y) {
    // yのマイナス方向の限界値を超えていないか
    if (y < SOCIAL_DISTANCE_ZONE_RADIUS) y = SOCIAL_DISTANCE_ZONE_RADIUS
    // yのプラス方向の限界値を超えていないか
    else if (y > FIELD_HEIGHT - SOCIAL_DISTANCE_ZONE_RADIUS) { y = FIELD_HEIGHT - SOCIAL_DISTANCE_ZONE_RADIUS }
    return y
  }
}

module.exports = new Position()
