/**
 * ゲーム内で使用する定数の定義
 */

 // フィールドの高さ
const FIELD_HEIGHT = 500;
// プレイヤーが動けるフィールドの幅
const PLAYER_MOVABLE_FIELD_WIDTH = 1000;
// ソーシャルディスタンスゾーンの半径
const SOCIAL_DISTANCE_ZONE_RADIUS = 60;
// ぺこらのスタートポイント(x軸)
const PLAYER_PEKORA_START_POSITION_X = 0;
// ぺこらのスタートポイント(y軸)
const PLAYER_PEKORA_START_POSITION_Y = FIELD_HEIGHT / 2;
// ばいきんくんのスタートポイント(x軸)
const PLAYER_BAIKINKUN_START_POSITION_X = PLAYER_MOVABLE_FIELD_WIDTH - SOCIAL_DISTANCE_ZONE_RADIUS * 2;
// ばいきんくんのスタートポイント(y軸)
const PLAYER_BAIKINKUN_START_POSITION_Y = FIELD_HEIGHT / 2;
// 選択肢の単語数
const WORD_COUNT = 8;

module.exports.PLAYER_MOVABLE_FIELD_WIDTH = PLAYER_MOVABLE_FIELD_WIDTH;
module.exports.SOCIAL_DISTANCE_ZONE_RADIUS = SOCIAL_DISTANCE_ZONE_RADIUS;
module.exports.PLAYER_PEKORA_START_POSITION_X = PLAYER_PEKORA_START_POSITION_X;
module.exports.PLAYER_PEKORA_START_POSITION_Y = PLAYER_PEKORA_START_POSITION_Y;
module.exports.PLAYER_BAIKINKUN_START_POSITION_X = PLAYER_BAIKINKUN_START_POSITION_X;
module.exports.PLAYER_BAIKINKUN_START_POSITION_Y = PLAYER_BAIKINKUN_START_POSITION_Y;
module.exports.WORD_COUNT = WORD_COUNT;
