import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";
import { updateProfile } from "./profileController.js";

const router = Router();

router.patch("/update", isAuthenticated, updateProfile);

export default router;