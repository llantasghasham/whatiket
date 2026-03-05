import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("financeiro_pagamentos_despesas", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "companies",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      despesa_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "financeiro_despesas",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      metodo_pagamento: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      data_pagamento: {
        type: DataTypes.DATE,
        allowNull: false
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("financeiro_pagamentos_despesas", ["company_id"]);
    await queryInterface.addIndex("financeiro_pagamentos_despesas", ["despesa_id"]);
    await queryInterface.addIndex("financeiro_pagamentos_despesas", ["data_pagamento"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("financeiro_pagamentos_despesas");
  }
};
