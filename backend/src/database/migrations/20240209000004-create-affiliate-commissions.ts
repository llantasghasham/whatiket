import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("AffiliateCommissions", {
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
      referredCompanyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Invoices",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      commissionAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      commissionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "paid", "cancelled"),
        defaultValue: "pending"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("AffiliateCommissions");
  }
};
