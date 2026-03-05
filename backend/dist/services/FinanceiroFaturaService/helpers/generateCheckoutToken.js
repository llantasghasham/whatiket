"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const FinanceiroFatura_1 = __importDefault(require("../../../models/FinanceiroFatura"));
const generateCheckoutToken = async () => {
    let token;
    let exists = true;
    do {
        token = (0, crypto_1.randomBytes)(16).toString("hex");
        const count = await FinanceiroFatura_1.default.count({ where: { checkoutToken: token } });
        exists = count > 0;
    } while (exists);
    return token;
};
exports.default = generateCheckoutToken;
