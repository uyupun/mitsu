const {
  PLAYER_MOVABLE_FIELD_WIDTH,
  SOCIAL_DISTANCE_ZONE_RADIUS
} = require('./constants')

class Judge {
  /**
   * うさぎさんの勝利判定
   */
  isGoal (x) {
    if (x + SOCIAL_DISTANCE_ZONE_RADIUS >= PLAYER_MOVABLE_FIELD_WIDTH) { return true }
    return false
  }

  /**
   * 当たり判定(ばいきんくんの勝利判定)
   *
   * @param {*} positionA
   * @param {*} positionB
   */
  isHit (positionA, positionB) {
    // 二点間の距離
    const distance = Math.sqrt(
      (positionB.x - positionA.x) ** 2 + (positionB.y - positionA.y) ** 2
    )
    // 二点間の距離が各Playerの和以下なら衝突している
    if (distance <= SOCIAL_DISTANCE_ZONE_RADIUS * 2) return true
    return false
  }
}

module.exports = new Judge()
