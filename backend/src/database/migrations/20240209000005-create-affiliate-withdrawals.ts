import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("AffiliateWithdrawals", {
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending"
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false
      },
      paymentDetails: {
        type: DataTypes.JSON,
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      processedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("AffiliateWithdrawals");
  }
};
