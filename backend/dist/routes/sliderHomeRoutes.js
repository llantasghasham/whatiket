"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const sliderUpload_1 = __importDefault(require("../config/sliderUpload"));
const SliderHomeController = __importStar(require("../controllers/SliderHomeController"));
const sliderHomeRoutes = express_1.default.Router();
const upload = (0, multer_1.default)(sliderUpload_1.default);
sliderHomeRoutes.use(isAuth_1.default);
sliderHomeRoutes.get("/slider-home", SliderHomeController.index);
sliderHomeRoutes.get("/slider-home/:sliderId", SliderHomeController.show);
sliderHomeRoutes.post("/slider-home", upload.single("image"), SliderHomeController.store);
sliderHomeRoutes.put("/slider-home/:sliderId", upload.single("image"), SliderHomeController.update);
sliderHomeRoutes.delete("/slider-home/:sliderId", SliderHomeController.remove);
exports.default = sliderHomeRoutes;
