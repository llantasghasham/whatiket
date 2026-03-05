"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("financeiro_categorias", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            company_id: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: "companies",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            nome: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false
            },
            tipo: {
                type: sequelize_1.DataTypes.ENUM("despesa", "receita"),
                allowNull: false
            },
            pai_id: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: "financeiro_categorias",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            cor: {
                type: sequelize_1.DataTypes.STRING(7),
                allowNull: true
            },
            ativo: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updated_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
        await queryInterface.addIndex("financeiro_categorias", ["company_id"]);
        await queryInterface.addIndex("financeiro_categorias", ["tipo"]);
        await queryInterface.addIndex("financeiro_categorias", ["pai_id"]);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("financeiro_categorias");
    }
};
