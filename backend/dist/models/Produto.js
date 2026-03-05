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
// @ts-nocheck
const sequelize_typescript_1 = require("sequelize-typescript");
const Company_1 = __importDefault(require("./Company"));
const ProdutoCategoria_1 = __importDefault(require("./ProdutoCategoria"));
const ProdutoVariacaoItem_1 = __importDefault(require("./ProdutoVariacaoItem"));
let Produto = class Produto extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Produto.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Produto.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Produto.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ProdutoCategoria_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Produto.prototype, "categoriaId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ProdutoCategoria_1.default),
    __metadata("design:type", ProdutoCategoria_1.default)
], Produto.prototype, "categoria", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], Produto.prototype, "tipo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    __metadata("design:type", String)
], Produto.prototype, "nome", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Produto.prototype, "descricao", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(12, 2)),
    __metadata("design:type", Number)
], Produto.prototype, "valor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(20), defaultValue: "disponivel" }),
    __metadata("design:type", String)
], Produto.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Produto.prototype, "imagem_principal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    __metadata("design:type", Object)
], Produto.prototype, "galeria", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    __metadata("design:type", Object)
], Produto.prototype, "dados_especificos", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, field: "controleEstoque", defaultValue: false }),
    __metadata("design:type", Boolean)
], Produto.prototype, "controleEstoque", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: "estoqueAtual", defaultValue: 0 }),
    __metadata("design:type", Number)
], Produto.prototype, "estoqueAtual", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: "estoqueMinimo", defaultValue: 0 }),
    __metadata("design:type", Number)
], Produto.prototype, "estoqueMinimo", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ProdutoVariacaoItem_1.default),
    __metadata("design:type", Array)
], Produto.prototype, "variacoes", void 0);
Produto = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "Produtos"
    })
], Produto);
exports.default = Produto;
