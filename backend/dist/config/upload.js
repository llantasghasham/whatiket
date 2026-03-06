"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const User_1 = __importDefault(require("../models/User"));
const lodash_1 = require("lodash");
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "public");
exports.default = {
    directory: publicFolder,
    storage: multer_1.default.diskStorage({
        destination: async function (req, file, cb) {
            let companyId = req.user?.companyId;
            const { typeArch, fileId } = req.body;
            // Foto de usuario: usar companyId del usuario editado (permite superadmin editar cualquier usuario)
            if (typeArch === "user" && req.params?.userId) {
                try {
                    const targetUser = await User_1.default.findByPk(req.params.userId, { attributes: ["companyId"] });
                    if (targetUser?.companyId != null)
                        companyId = targetUser.companyId;
                }
                catch (_) { }
            }
            if (companyId === undefined && (0, lodash_1.isNil)(companyId) && (0, lodash_1.isEmpty)(companyId)) {
                const authHeader = req.headers.authorization;
                const [, token] = authHeader.split(" ");
                const whatsapp = await Whatsapp_1.default.findOne({ where: { token } });
                companyId = whatsapp.companyId;
            }
            let folder;
            if (typeArch && typeArch !== "announcements" && typeArch !== "logo" && typeArch !== "terms" && typeArch !== "dashboard") {
                folder = path_1.default.resolve(publicFolder, `company${companyId}`, typeArch, fileId ? fileId : "");
            }
            else if (typeArch && typeArch === "announcements") {
                folder = path_1.default.resolve(publicFolder, typeArch);
            }
            else if (typeArch === "logo" || typeArch === "terms" || typeArch === "dashboard") {
                folder = path_1.default.resolve(publicFolder);
            }
            else {
                folder = path_1.default.resolve(publicFolder, `company${companyId}`);
            }
            if (!fs_1.default.existsSync(folder)) {
                fs_1.default.mkdirSync(folder, { recursive: true });
                fs_1.default.chmodSync(folder, 0o777);
            }
            return cb(null, folder);
        },
        filename(req, file, cb) {
            const { typeArch, mode } = req.body;
            let fileName;
            // Dashboard images use fixed names
            if (typeArch === "dashboard" && mode) {
                fileName = `dashboard-image-${mode}.png`;
            }
            // Announcements use timestamp
            else if (typeArch && typeArch === "announcements") {
                fileName = new Date().getTime() + '_' + file.originalname.replace('/', '-').replace(/ /g, "_");
            }
            // Others use original name
            else {
                fileName = file.originalname.replace('/', '-').replace(/ /g, "_");
            }
            return cb(null, fileName);
        }
    })
};
