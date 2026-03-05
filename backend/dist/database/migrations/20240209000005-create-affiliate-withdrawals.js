"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable("AffiliateWithdrawals", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            affiliateId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Affiliates",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            amount: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending"
            },
            paymentMethod: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            paymentDetails: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            rejectionReason: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            processedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            },
            processedBy: {
                type: sequelize_1.DataTypes.INTEGER,
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
    down: async (queryInterface) => {
        await queryInterface.dropTable("AffiliateWithdrawals");
    }
};
