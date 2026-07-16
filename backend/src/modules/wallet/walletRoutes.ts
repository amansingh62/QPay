import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { getWallet } from "./walletController.js";

const router = Router();

router.get("/getWallet", isAuthenticated, getWallet);

export default router;