"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicUrl = exports.getFrontendUrl = exports.getBackendUrl = void 0;
const WhitelabelService_1 = require("./WhitelabelService");
const getBackendUrl = async (companyId) => {
    const config = await (0, WhitelabelService_1.getWhitelabelConfig)(companyId);
    return config.backendUrl || process.env.BACKEND_URL || "http://localhost:8090";
};
exports.getBackendUrl = getBackendUrl;
const getFrontendUrl = async (companyId) => {
    const config = await (0, WhitelabelService_1.getWhitelabelConfig)(companyId);
    return config.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3000";
};
exports.getFrontendUrl = getFrontendUrl;
const getPublicUrl = async (companyId, path) => {
    const backendUrl = await (0, exports.getBackendUrl)(companyId);
    return `${backendUrl}/public${path}`;
};
exports.getPublicUrl = getPublicUrl;
