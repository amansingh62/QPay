import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { changeTransactionPin, setTransactionPin } from "./securityController.js";

const router = Router();

router.post("/create", isAuthenticated, setTransactionPin);
router.patch("/change", isAuthenticated, changeTransactionPin);

export default router;