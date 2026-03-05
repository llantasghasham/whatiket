"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable("Affiliates", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Companies",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            affiliateCode: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            commissionRate: {
                type: sequelize_1.DataTypes.DECIMAL(5, 2),
                allowNull: false
            },
            minWithdrawAmount: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            totalEarned: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                defaultValue: 0
            },
            totalWithdrawn: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                defaultValue: 0
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("active", "inactive", "suspended"),
                defaultValue: "active"
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
        await queryInterface.dropTable("Affiliates");
    }
};
