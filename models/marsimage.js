'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarsImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  MarsImage.init({
    url: DataTypes.STRING,
    imageId: DataTypes.INTEGER,
    earthDate: DataTypes.STRING,
    sol: DataTypes.INTEGER,
    camera: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MarsImage',
  });
  return MarsImage;
};