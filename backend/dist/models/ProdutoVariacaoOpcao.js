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
const ProdutoVariacaoGrupo_1 = __importDefault(require("./ProdutoVariacaoGrupo"));
const ProdutoVariacaoItem_1 = __importDefault(require("./ProdutoVariacaoItem"));
let ProdutoVariacaoOpcao = class ProdutoVariacaoOpcao extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProdutoVariacaoOpcao.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ProdutoVariacaoGrupo_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ProdutoVariacaoOpcao.prototype, "grupoId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ProdutoVariacaoGrupo_1.default),
    __metadata("design:type", ProdutoVariacaoGrupo_1.default)
], ProdutoVariacaoOpcao.prototype, "grupo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], ProdutoVariacaoOpcao.prototype, "nome", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0 }),
    __metadata("design:type", Number)
], ProdutoVariacaoOpcao.prototype, "ordem", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => ProdutoVariacaoItem_1.default),
    __metadata("design:type", Array)
], ProdutoVariacaoOpcao.prototype, "itens", void 0);
ProdutoVariacaoOpcao = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "ProdutoVariacaoOpcoes"
    })
], ProdutoVariacaoOpcao);
exports.default = ProdutoVariacaoOpcao;
