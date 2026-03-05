"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addColumn("Plans", "affiliateCommissionRate", {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Plans", "affiliateCommissionRate");
    }
};
