import express from "express";
import cors from "cors";

import authRouter from "./api/auth.router";

export const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// mount auth routes
app.use("/api/auth", authRouter);
