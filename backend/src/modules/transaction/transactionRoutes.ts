import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { transactions } from "./transactionController.js";

const router = Router();

router.get("/", isAuthenticated, transactions);

export default router;