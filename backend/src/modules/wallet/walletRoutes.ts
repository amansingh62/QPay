import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { addMoney, getBankAccounts, getWallet, linkBankAccount, withdraw } from "./walletController.js";
import { isFrozen } from "../../middlewares/freezeMiddleware.js";

const router = Router();

router.get("/wallet", isAuthenticated, getWallet);
router.get("/bankAccounts", isAuthenticated, getBankAccounts);

router.post("/bankAccount", isAuthenticated, linkBankAccount);
router.post("/deposit", isAuthenticated, isFrozen, addMoney);
router.post("/withdraw", isAuthenticated, isFrozen, withdraw);

export default router;