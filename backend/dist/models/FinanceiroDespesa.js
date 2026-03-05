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
const FinanceiroFornecedor_1 = __importDefault(require("./FinanceiroFornecedor"));
const FinanceiroCategoria_1 = __importDefault(require("./FinanceiroCategoria"));
const FinanceiroPagamentoDespesa_1 = __importDefault(require("./FinanceiroPagamentoDespesa"));
let FinanceiroDespesa = class FinanceiroDespesa extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.Column)({ field: "company_id", type: sequelize_typescript_1.DataType.BIGINT }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], FinanceiroDespesa.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FinanceiroFornecedor_1.default),
    (0, sequelize_typescript_1.Column)({ field: "fornecedor_id", type: sequelize_typescript_1.DataType.BIGINT, allowNull: true }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "fornecedorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => FinanceiroFornecedor_1.default),
    __metadata("design:type", FinanceiroFornecedor_1.default)
], FinanceiroDespesa.prototype, "fornecedor", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FinanceiroCategoria_1.default),
    (0, sequelize_typescript_1.Column)({ field: "categoria_id", type: sequelize_typescript_1.DataType.BIGINT, allowNull: true }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "categoriaId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => FinanceiroCategoria_1.default),
    __metadata("design:type", FinanceiroCategoria_1.default)
], FinanceiroDespesa.prototype, "categoria", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "descricao", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(14, 2) }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "valor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "valor_pago", type: sequelize_typescript_1.DataType.DECIMAL(14, 2), defaultValue: 0 }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "valorPago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_vencimento", type: sequelize_typescript_1.DataType.DATEONLY }),
    __metadata("design:type", Date)
], FinanceiroDespesa.prototype, "dataVencimento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_pagamento", type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], FinanceiroDespesa.prototype, "dataPagamento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "metodo_pagamento_previsto", type: sequelize_typescript_1.DataType.STRING(50), allowNull: true }),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "metodoPagamentoPrevisto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "metodo_pagamento_real", type: sequelize_typescript_1.DataType.STRING(50), allowNull: true }),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "metodoPagamentoReal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "observacoes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "anexo_url", type: sequelize_typescript_1.DataType.STRING(500), allowNull: true }),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "anexoUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], FinanceiroDespesa.prototype, "recorrente", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_inicio", type: sequelize_typescript_1.DataType.DATEONLY, allowNull: true }),
    __metadata("design:type", Date)
], FinanceiroDespesa.prototype, "dataInicio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "data_fim", type: sequelize_typescript_1.DataType.DATEONLY, allowNull: true }),
    __metadata("design:type", Date)
], FinanceiroDespesa.prototype, "dataFim", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "tipo_recorrencia", type: sequelize_typescript_1.DataType.STRING(20), defaultValue: "mensal", allowNull: true }),
    __metadata("design:type", String)
], FinanceiroDespesa.prototype, "tipoRecorrencia", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "quantidade_ciclos", type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "quantidadeCiclos", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ field: "ciclo_atual", type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1 }),
    __metadata("design:type", Number)
], FinanceiroDespesa.prototype, "cicloAtual", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ field: "created_at" }),
    __metadata("design:type", Date)
], FinanceiroDespesa.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)({ field: "updated_at" }),
    __metadata("design:type", Date)
], FinanceiroDespesa.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => FinanceiroPagamentoDespesa_1.default, { foreignKey: "despesaId" }),
    __metadata("design:type", Array)
], FinanceiroDespesa.prototype, "pagamentos", void 0);
FinanceiroDespesa = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "financeiro_despesas"
    })
], FinanceiroDespesa);
exports.default = FinanceiroDespesa;
