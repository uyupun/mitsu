'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  User.init({
    userId: DataTypes.STRING,
    password: DataTypes.STRING,
    avatarId: DataTypes.INTEGER,
    skinPekoraId: DataTypes.INTEGER,
    skinBaikinkunId: DataTypes.INTEGER,
    rate: DataTypes.INTEGER,
    win: DataTypes.INTEGER,
    lose: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
    underscored: true
  })
  return User
}
