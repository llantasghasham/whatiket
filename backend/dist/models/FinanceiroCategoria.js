"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FinanceiroCategoria_1;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Company_1 = __importDefault(require("./Company"));
let FinanceiroCategoria = FinanceiroCategoria_1 = class FinanceiroCategoria extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], FinanceiroCategoria.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroCategoria.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], FinanceiroCategoria.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], FinanceiroCategoria.prototype, "nome", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], FinanceiroCategoria.prototype, "tipo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "pai_id", type: sequelize_typescript_1.DataType.BIGINT, allowNull: true }),
    __metadata("design:type", Number)
], FinanceiroCategoria.prototype, "paiId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FinanceiroCategoria_1),
    (0, sequelize_typescript_1.BelongsTo)(() => FinanceiroCategoria_1, { foreignKey: "paiId" }),
    __metadata("design:type", FinanceiroCategoria)
], FinanceiroCategoria.prototype, "pai", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => FinanceiroCategoria_1, { foreignKey: "paiId" }),
    __metadata("design:type", Array)
], FinanceiroCategoria.prototype, "filhos", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(7)),
    __metadata("design:type", String)
], FinanceiroCategoria.prototype, "cor", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], FinanceiroCategoria.prototype, "ativo", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], FinanceiroCategoria.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], FinanceiroCategoria.prototype, "updatedAt", void 0);
FinanceiroCategoria = FinanceiroCategoria_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "financeiro_categorias"
    })
], FinanceiroCategoria);
exports.default = FinanceiroCategoria;
