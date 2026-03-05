"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("financeiro_fornecedores", {
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
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            documento: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true
            },
            email: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            },
            telefone: {
                type: sequelize_1.DataTypes.STRING(30),
                allowNull: true
            },
            endereco: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            numero: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true
            },
            complemento: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            },
            bairro: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            },
            cidade: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            },
            estado: {
                type: sequelize_1.DataTypes.STRING(2),
                allowNull: true
            },
            cep: {
                type: sequelize_1.DataTypes.STRING(10),
                allowNull: true
            },
            categoria: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            },
            observacoes: {
                type: sequelize_1.DataTypes.TEXT,
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
        await queryInterface.addIndex("financeiro_fornecedores", ["company_id"]);
        await queryInterface.addIndex("financeiro_fornecedores", ["nome"]);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("financeiro_fornecedores");
    }
};
