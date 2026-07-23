import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { setTransactionPin } from "./securityController.js";

const router = Router();

router.post("/create", isAuthenticated, setTransactionPin);

export default router;