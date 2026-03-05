import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar campos à tabela Companies
    await queryInterface.addColumn("Companies", "affiliateId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Affiliates",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Companies", "couponId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Coupons",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Companies", "referredBy", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Companies",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Companies", "affiliateId");
    await queryInterface.removeColumn("Companies", "couponId");
    await queryInterface.removeColumn("Companies", "referredBy");
  }
};
