"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class IaWorkflow extends sequelize_1.Model {
}
IaWorkflow.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    companyId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    orchestratorPromptId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    agentPromptId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    alias: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: database_1.default,
    modelName: "IaWorkflow"
});
exports.default = IaWorkflow;
