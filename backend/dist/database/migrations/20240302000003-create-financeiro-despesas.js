"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("financeiro_despesas", {
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
            fornecedor_id: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: "financeiro_fornecedores",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            categoria_id: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: "financeiro_categorias",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            descricao: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            valor: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("aberta", "paga", "vencida", "cancelada"),
                allowNull: false,
                defaultValue: "aberta"
            },
            data_vencimento: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            data_pagamento: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            },
            metodo_pagamento_previsto: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true
            },
            metodo_pagamento_real: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true
            },
            observacoes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            recorrente: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            data_inicio: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            },
            data_fim: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            },
            tipo_recorrencia: {
                type: sequelize_1.DataTypes.ENUM("diario", "semanal", "mensal", "anual"),
                allowNull: true
            },
            quantidade_ciclos: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            ciclo_atual: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
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
        await queryInterface.addIndex("financeiro_despesas", ["company_id"]);
        await queryInterface.addIndex("financeiro_despesas", ["fornecedor_id"]);
        await queryInterface.addIndex("financeiro_despesas", ["categoria_id"]);
        await queryInterface.addIndex("financeiro_despesas", ["status"]);
        await queryInterface.addIndex("financeiro_despesas", ["data_vencimento"]);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("financeiro_despesas");
    }
};
