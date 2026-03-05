import { Router } from "express";
import isAuth from "../middleware/isAuth";
import { index, store, show, update } from "../controllers/ServiceOrderController";

const serviceOrderRoutes = Router();

serviceOrderRoutes.get("/service-orders", isAuth, index);
serviceOrderRoutes.post("/service-orders", isAuth, store);
serviceOrderRoutes.get("/service-orders/:serviceOrderId", isAuth, show);
serviceOrderRoutes.put("/service-orders/:serviceOrderId", isAuth, update);

export default serviceOrderRoutes;
