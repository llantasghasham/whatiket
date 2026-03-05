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
const FinanceiroFatura_1 = __importDefault(require("./FinanceiroFatura"));
let FinanceiroPagamento = class FinanceiroPagamento extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], FinanceiroPagamento.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroPagamento.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], FinanceiroPagamento.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FinanceiroFatura_1.default),
    (0, sequelize_typescript_1.Column)({ field: "fatura_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroPagamento.prototype, "faturaId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => FinanceiroFatura_1.default),
    __metadata("design:type", FinanceiroFatura_1.default)
], FinanceiroPagamento.prototype, "fatura", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "metodo_pagamento", type: sequelize_typescript_1.DataType.STRING(20) }),
    __metadata("design:type", String)
], FinanceiroPagamento.prototype, "metodoPagamento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(14, 2)),
    __metadata("design:type", String)
], FinanceiroPagamento.prototype, "valor", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)({ field: "data_pagamento", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], FinanceiroPagamento.prototype, "dataPagamento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], FinanceiroPagamento.prototype, "observacoes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], FinanceiroPagamento.prototype, "createdAt", void 0);
FinanceiroPagamento = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "financeiro_pagamentos",
        timestamps: false
    })
], FinanceiroPagamento);
exports.default = FinanceiroPagamento;
