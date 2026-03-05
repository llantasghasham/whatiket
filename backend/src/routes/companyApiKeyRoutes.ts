import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CompanyApiKeysController from "../controllers/CompanyApiKeysController";
import { update as updateApiKeyField } from "../controllers/CompanyApiKeyController";

const companyApiKeyRoutes = Router();

companyApiKeyRoutes.get(
  "/company-api-keys",
  isAuth,
  CompanyApiKeysController.index
);

companyApiKeyRoutes.post(
  "/company-api-keys",
  isAuth,
  CompanyApiKeysController.store
);

companyApiKeyRoutes.put(
  "/company-api-keys/:id",
  isAuth,
  CompanyApiKeysController.update
);

companyApiKeyRoutes.delete(
  "/company-api-keys/:id",
  isAuth,
  CompanyApiKeysController.remove
);

// Nova rota para atualizar campos específicos de API keys
companyApiKeyRoutes.put(
  "/api-key-field",
  isAuth,
  updateApiKeyField
);

export default companyApiKeyRoutes;
