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
const CrmClient_1 = __importDefault(require("./CrmClient"));
const Project_1 = __importDefault(require("./Project"));
const FinanceiroPagamento_1 = __importDefault(require("./FinanceiroPagamento"));
const sequelize_typescript_2 = require("sequelize-typescript");
let FinanceiroFatura = class FinanceiroFatura extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], FinanceiroFatura.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CrmClient_1.default),
    (0, sequelize_typescript_1.Column)({ field: "client_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "clientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CrmClient_1.default),
    __metadata("design:type", CrmClient_1.default)
], FinanceiroFatura.prototype, "client", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Project_1.default),
    (0, sequelize_typescript_1.Column)({ field: "project_id", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "projectId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Project_1.default),
    __metadata("design:type", Project_1.default)
], FinanceiroFatura.prototype, "project", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "descricao", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(14, 2)),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "valor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "valor_pago", type: sequelize_typescript_1.DataType.DECIMAL(14, 2), defaultValue: 0 }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "valorPago", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("aberta"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_vencimento", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], FinanceiroFatura.prototype, "dataVencimento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_pagamento", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], FinanceiroFatura.prototype, "dataPagamento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "tipo_referencia", type: sequelize_typescript_1.DataType.STRING(20) }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "tipoReferencia", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "referencia_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "referenciaId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("unica"),
    (0, sequelize_typescript_1.Column)({ field: "tipo_recorrencia", type: sequelize_typescript_1.DataType.STRING(20) }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "tipoRecorrencia", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "quantidade_ciclos", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "quantidadeCiclos", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)({ field: "ciclo_atual", type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], FinanceiroFatura.prototype, "cicloAtual", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)({ field: "data_inicio", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], FinanceiroFatura.prototype, "dataInicio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_fim", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], FinanceiroFatura.prototype, "dataFim", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], FinanceiroFatura.prototype, "ativa", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "observacoes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "payment_provider", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "paymentProvider", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "payment_link", type: sequelize_typescript_1.DataType.TEXT }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "paymentLink", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "payment_external_id", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "paymentExternalId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "checkout_token", type: sequelize_typescript_1.DataType.STRING }),
    __metadata("design:type", String)
], FinanceiroFatura.prototype, "checkoutToken", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], FinanceiroFatura.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at", type: sequelize_typescript_1.DataType.DATE }),
    __metadata("design:type", Date)
], FinanceiroFatura.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_2.HasMany)(() => FinanceiroPagamento_1.default),
    __metadata("design:type", Array)
], FinanceiroFatura.prototype, "pagamentos", void 0);
FinanceiroFatura = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "financeiro_faturas"
    })
], FinanceiroFatura);
exports.default = FinanceiroFatura;
