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
const ServiceOrder_1 = __importDefault(require("./ServiceOrder"));
const Produto_1 = __importDefault(require("./Produto"));
const Servico_1 = __importDefault(require("./Servico"));
let ServiceOrderItem = class ServiceOrderItem extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ServiceOrder_1.default),
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "serviceOrderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ServiceOrder_1.default),
    __metadata("design:type", ServiceOrder_1.default)
], ServiceOrderItem.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], ServiceOrderItem.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], ServiceOrderItem.prototype, "itemType", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Servico_1.default),
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "serviceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Servico_1.default),
    __metadata("design:type", Servico_1.default)
], ServiceOrderItem.prototype, "service", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Produto_1.default),
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Produto_1.default),
    __metadata("design:type", Produto_1.default)
], ServiceOrderItem.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    __metadata("design:type", String)
], ServiceOrderItem.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(12, 2)),
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "unitPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(12, 2)),
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "discount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(12, 2)),
    __metadata("design:type", Number)
], ServiceOrderItem.prototype, "total", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ServiceOrderItem.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ServiceOrderItem.prototype, "updatedAt", void 0);
ServiceOrderItem = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "ServiceOrderItems" })
], ServiceOrderItem);
exports.default = ServiceOrderItem;
