"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const ServiceOrderController_1 = require("../controllers/ServiceOrderController");
const serviceOrderRoutes = (0, express_1.Router)();
serviceOrderRoutes.get("/service-orders", isAuth_1.default, ServiceOrderController_1.index);
serviceOrderRoutes.post("/service-orders", isAuth_1.default, ServiceOrderController_1.store);
serviceOrderRoutes.get("/service-orders/:serviceOrderId", isAuth_1.default, ServiceOrderController_1.show);
serviceOrderRoutes.put("/service-orders/:serviceOrderId", isAuth_1.default, ServiceOrderController_1.update);
exports.default = serviceOrderRoutes;
