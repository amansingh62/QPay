import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/authRoutes.js";
import profileRoutes from "./modules/profile/profileRoutes.js";

import walletRoutes from "./modules/wallet/walletRoutes.js";
import transferRoutes from "./modules/transfer/transferRoutes.js";
import securityRoutes from "./modules/security/securityRoutes.js";

import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/wallet", walletRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/security", securityRoutes);

export default app;