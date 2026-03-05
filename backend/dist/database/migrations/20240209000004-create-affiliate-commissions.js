"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable("AffiliateCommissions", {
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
            referredCompanyId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Companies",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            invoiceId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Invoices",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            commissionAmount: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            commissionRate: {
                type: sequelize_1.DataTypes.DECIMAL(5, 2),
                allowNull: false
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("pending", "approved", "paid", "cancelled"),
                defaultValue: "pending"
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            metadata: {
                type: sequelize_1.DataTypes.JSON,
                defaultValue: {}
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            paidAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("AffiliateCommissions");
    }
};
