import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("financeiro_categorias", {
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
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM("despesa", "receita"),
        allowNull: false
      },
      pai_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "financeiro_categorias",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      cor: {
        type: DataTypes.STRING(7),
        allowNull: true
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex("financeiro_categorias", ["company_id"]);
    await queryInterface.addIndex("financeiro_categorias", ["tipo"]);
    await queryInterface.addIndex("financeiro_categorias", ["pai_id"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("financeiro_categorias");
  }
};
