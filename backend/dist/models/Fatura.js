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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Company_1 = __importDefault(require("./Company"));
const Contact_1 = __importDefault(require("./Contact"));
let Fatura = class Fatura extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Fatura.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Fatura.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Fatura.prototype, "contactId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Fatura.prototype, "valor", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Fatura.prototype, "descricao", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Fatura.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Fatura.prototype, "dataCriacao", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Fatura.prototype, "dataVencimento", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Fatura.prototype, "dataPagamento", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Fatura.prototype, "recorrente", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Fatura.prototype, "intervalo", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Fatura.prototype, "proximaCobranca", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Fatura.prototype, "limiteRecorrencias", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Fatura.prototype, "recorrenciasRealizadas", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Fatura.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Fatura.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Fatura.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], Fatura.prototype, "contact", void 0);
Fatura = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "Faturas" })
], Fatura);
exports.default = Fatura;
