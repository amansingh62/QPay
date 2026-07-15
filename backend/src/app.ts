import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/authRoutes.js";
import profileRoutes from "./modules/profile/profileRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

export default app;