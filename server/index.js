import dotenv from "dotenv";
import dns from "dns";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL(".env", import.meta.url)) });

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import casesRouter from "./routes/cases.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/cases", casesRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("\u2705 MongoDB connected");
    app.listen(PORT);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
