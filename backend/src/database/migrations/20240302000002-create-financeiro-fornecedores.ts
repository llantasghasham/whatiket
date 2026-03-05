import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("financeiro_fornecedores", {
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
        type: DataTypes.STRING(255),
        allowNull: false
      },
      documento: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      telefone: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      endereco: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      numero: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      complemento: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      bairro: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      cidade: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      cep: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      observacoes: {
        type: DataTypes.TEXT,
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

    await queryInterface.addIndex("financeiro_fornecedores", ["company_id"]);
    await queryInterface.addIndex("financeiro_fornecedores", ["nome"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("financeiro_fornecedores");
  }
};
