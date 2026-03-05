"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiToken = void 0;
const crypto_1 = require("crypto");
const generateApiToken = (size = 48) => {
    return (0, crypto_1.randomBytes)(size).toString("hex");
};
exports.generateApiToken = generateApiToken;
exports.default = exports.generateApiToken;
