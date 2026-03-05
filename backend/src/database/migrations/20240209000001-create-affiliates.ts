import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Affiliates", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      affiliateCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      commissionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      minWithdrawAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      totalEarned: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      totalWithdrawn: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        defaultValue: "active"
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
    await queryInterface.dropTable("Affiliates");
  }
};
