import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { addMoney, getBankAccounts, getWallet, linkBankAccount } from "./walletController.js";
import { isFrozen } from "../../middlewares/freezeMiddleware.js";

const router = Router();

router.get("/getWallet", isAuthenticated, getWallet);
router.get("/bankAccounts", isAuthenticated, getBankAccounts);

router.post("/bankAccount", isAuthenticated, linkBankAccount);
router.post("/deposit", isAuthenticated, isFrozen, addMoney);

export default router;