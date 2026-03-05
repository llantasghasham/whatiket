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
const Invoices_1 = __importDefault(require("./Invoices"));
const FinanceiroFatura_1 = __importDefault(require("./FinanceiroFatura"));
let AffiliateCommission = class AffiliateCommission extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "affiliateId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "referredCompanyId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Invoices_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "invoiceId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FinanceiroFatura_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "faturaId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "commissionAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(5, 2)),
    __metadata("design:type", Number)
], AffiliateCommission.prototype, "commissionRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("pending"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM("pending", "approved", "paid", "cancelled")),
    __metadata("design:type", String)
], AffiliateCommission.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AffiliateCommission.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], AffiliateCommission.prototype, "metadata", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], AffiliateCommission.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], AffiliateCommission.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], AffiliateCommission.prototype, "paidAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default, { foreignKey: "referredCompanyId" }),
    __metadata("design:type", Company_1.default)
], AffiliateCommission.prototype, "referredCompany", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Invoices_1.default),
    __metadata("design:type", Invoices_1.default)
], AffiliateCommission.prototype, "invoice", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => FinanceiroFatura_1.default),
    __metadata("design:type", FinanceiroFatura_1.default)
], AffiliateCommission.prototype, "fatura", void 0);
AffiliateCommission = __decorate([
    sequelize_typescript_1.Table
], AffiliateCommission);
exports.default = AffiliateCommission;
