import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./core/errors/ApiError.js";

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workforce OS API is running",
  });
});

/* =========================
   API ROUTES
========================= */

import routes from "./routes/index.js";
import errorHandler from "./core/errors/errorHandler.js";

app.use("/api/v1", routes);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

export default app;
