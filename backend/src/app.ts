import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/authRoutes.js"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;