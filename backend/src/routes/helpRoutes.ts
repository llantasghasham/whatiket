import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as HelpController from "../controllers/HelpController";

const routes = express.Router();
const upload = multer(uploadConfig);

routes.get("/helps/list", isAuth, HelpController.findList);

routes.get("/helps", isAuth, HelpController.index);

routes.get("/helps/:id", isAuth, HelpController.show);

routes.post("/helps", isAuth, HelpController.store);

routes.post("/helps/upload", isAuth, upload.single("file"), HelpController.uploadFile);

routes.put("/helps/:id", isAuth, HelpController.update);

routes.delete("/helps/:id", isAuth, HelpController.remove);

export default routes;
