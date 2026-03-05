"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("financeiro_pagamentos_despesas", {
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
            despesa_id: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: "financeiro_despesas",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            valor: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            metodo_pagamento: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false
            },
            data_pagamento: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            observacoes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
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
        await queryInterface.addIndex("financeiro_pagamentos_despesas", ["company_id"]);
        await queryInterface.addIndex("financeiro_pagamentos_despesas", ["despesa_id"]);
        await queryInterface.addIndex("financeiro_pagamentos_despesas", ["data_pagamento"]);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("financeiro_pagamentos_despesas");
    }
};
