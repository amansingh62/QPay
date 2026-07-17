import Router from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { searchUsers } from "./transferController.js";

const router = Router();

router.get("/searchUser", isAuthenticated, searchUsers);

export default router;