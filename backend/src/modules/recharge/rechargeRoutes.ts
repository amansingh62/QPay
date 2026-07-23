import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { isFrozen } from "../../middlewares/freezeMiddleware.js";
import { recharge } from "./rechargeController.js";

const router = Router();

router.post("/", isAuthenticated, isFrozen, recharge);

export default router;