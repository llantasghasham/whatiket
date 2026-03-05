"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable("AffiliateLinks", {
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
            code: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            url: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            clicks: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            signups: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            conversions: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            trackingData: {
                type: sequelize_1.DataTypes.JSON,
                defaultValue: {}
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("AffiliateLinks");
    }
};
