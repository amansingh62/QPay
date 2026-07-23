import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { searchUsers, transfer } from "./transferController.js";

const router = Router();

router.get("/searchUser", isAuthenticated, searchUsers);

router.post("/", isAuthenticated, transfer);

export default router;