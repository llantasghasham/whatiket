import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Whatsapps");
    if (!tableInfo.channel) {
      await queryInterface.addColumn("Whatsapps", "channel", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "whatsapp"
      });
      await queryInterface.sequelize.query(
        `UPDATE "Whatsapps" SET channel = 'telegram' WHERE LOWER(name) LIKE '%telegram%' AND (channel IS NULL OR channel = 'whatsapp')`
      );
      await queryInterface.sequelize.query(
        `UPDATE "Whatsapps" SET channel = 'whatsapp' WHERE channel IS NULL`
      );
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Whatsapps");
    if (tableInfo.channel) {
      await queryInterface.removeColumn("Whatsapps", "channel");
    }
  }
};
