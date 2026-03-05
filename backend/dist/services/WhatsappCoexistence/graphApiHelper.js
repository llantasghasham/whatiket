"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractGraphError = exports.graphRequest = exports.buildGraphClient = exports.getGraphBaseUrl = void 0;
const axios_1 = __importDefault(require("axios"));
const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";
const getGraphBaseUrl = () => {
    const normalized = DEFAULT_GRAPH_VERSION.startsWith("v")
        ? DEFAULT_GRAPH_VERSION
        : `v${DEFAULT_GRAPH_VERSION}`;
    return `https://graph.facebook.com/${normalized}`;
};
exports.getGraphBaseUrl = getGraphBaseUrl;
const buildGraphClient = (token) => axios_1.default.create({
    baseURL: (0, exports.getGraphBaseUrl)(),
    params: {
        access_token: token
    }
});
exports.buildGraphClient = buildGraphClient;
const graphRequest = async (token, method, path, data) => {
    const client = (0, exports.buildGraphClient)(token);
    const response = await client.request({
        method,
        url: path,
        data
    });
    return response.data;
};
exports.graphRequest = graphRequest;
const extractGraphError = (error) => {
    if (axios_1.default.isAxiosError(error)) {
        const err = error;
        return err.response?.data?.error?.message || err.message;
    }
    return error?.message || "Unexpected error";
};
exports.extractGraphError = extractGraphError;
