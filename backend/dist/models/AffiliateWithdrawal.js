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
const User_1 = __importDefault(require("./User"));
let AffiliateWithdrawal = class AffiliateWithdrawal extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateWithdrawal.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateWithdrawal.prototype, "affiliateId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], AffiliateWithdrawal.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("pending"),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM("pending", "approved", "rejected")),
    __metadata("design:type", String)
], AffiliateWithdrawal.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], AffiliateWithdrawal.prototype, "paymentMethod", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], AffiliateWithdrawal.prototype, "paymentDetails", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AffiliateWithdrawal.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AffiliateWithdrawal.prototype, "rejectionReason", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], AffiliateWithdrawal.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], AffiliateWithdrawal.prototype, "processedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AffiliateWithdrawal.prototype, "processedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.default, { foreignKey: "processedBy" }),
    __metadata("design:type", User_1.default)
], AffiliateWithdrawal.prototype, "processor", void 0);
AffiliateWithdrawal = __decorate([
    sequelize_typescript_1.Table
], AffiliateWithdrawal);
exports.default = AffiliateWithdrawal;
