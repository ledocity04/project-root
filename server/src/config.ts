import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT || 3001),
  JWT_SECRET: process.env.JWT_SECRET || "dev",
};
