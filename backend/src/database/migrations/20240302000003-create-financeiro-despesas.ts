import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("financeiro_despesas", {
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
      fornecedor_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "financeiro_fornecedores",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      categoria_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "financeiro_categorias",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("aberta", "paga", "vencida", "cancelada"),
        allowNull: false,
        defaultValue: "aberta"
      },
      data_vencimento: {
        type: DataTypes.DATE,
        allowNull: false
      },
      data_pagamento: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metodo_pagamento_previsto: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      metodo_pagamento_real: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      recorrente: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      data_inicio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      data_fim: {
        type: DataTypes.DATE,
        allowNull: true
      },
      tipo_recorrencia: {
        type: DataTypes.ENUM("diario", "semanal", "mensal", "anual"),
        allowNull: true
      },
      quantidade_ciclos: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ciclo_atual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
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

    await queryInterface.addIndex("financeiro_despesas", ["company_id"]);
    await queryInterface.addIndex("financeiro_despesas", ["fornecedor_id"]);
    await queryInterface.addIndex("financeiro_despesas", ["categoria_id"]);
    await queryInterface.addIndex("financeiro_despesas", ["status"]);
    await queryInterface.addIndex("financeiro_despesas", ["data_vencimento"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("financeiro_despesas");
  }
};
