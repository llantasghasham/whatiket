"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSliderRelativePath = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "public");
const sliderFolder = path_1.default.resolve(publicFolder, "company1", "slider");
const ensureFolder = () => {
    if (!fs_1.default.existsSync(sliderFolder)) {
        fs_1.default.mkdirSync(sliderFolder, { recursive: true });
        fs_1.default.chmodSync(sliderFolder, 0o777);
    }
};
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        ensureFolder();
        cb(null, sliderFolder);
    },
    filename: (_req, file, cb) => {
        const sanitized = file.originalname.replace(/\s+/g, "_").replace(/\/+/, "-");
        const uniqueName = `${Date.now()}_${sanitized}`;
        cb(null, uniqueName);
    }
});
const getSliderRelativePath = (filename) => `company1/slider/${filename}`;
exports.getSliderRelativePath = getSliderRelativePath;
exports.default = {
    storage
};
