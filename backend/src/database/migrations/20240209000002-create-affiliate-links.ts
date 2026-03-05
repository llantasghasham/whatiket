import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("AffiliateLinks", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      affiliateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Affiliates",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      signups: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      conversions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      trackingData: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("AffiliateLinks");
  }
};
