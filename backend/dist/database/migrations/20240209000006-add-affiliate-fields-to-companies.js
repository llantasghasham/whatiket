"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        // Adicionar campos à tabela Companies
        await queryInterface.addColumn("Companies", "affiliateId", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Affiliates",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addColumn("Companies", "couponId", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Coupons",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addColumn("Companies", "referredBy", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Companies",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Companies", "affiliateId");
        await queryInterface.removeColumn("Companies", "couponId");
        await queryInterface.removeColumn("Companies", "referredBy");
    }
};
