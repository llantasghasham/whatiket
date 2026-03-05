"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable("Coupons", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            code: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            discountType: {
                type: sequelize_1.DataTypes.ENUM("percentage", "fixed"),
                defaultValue: "percentage"
            },
            discountValue: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            minPlanAmount: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            maxUses: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            usedCount: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            validUntil: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("Coupons");
    }
};
