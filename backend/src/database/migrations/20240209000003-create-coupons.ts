import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Coupons", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        defaultValue: "percentage"
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      minPlanAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      maxUses: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("Coupons");
  }
};
