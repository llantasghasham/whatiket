import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Plans", "affiliateCommissionRate", {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Plans", "affiliateCommissionRate");
  }
};
