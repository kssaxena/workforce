import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import errorHandler from "./core/errors/errorHandler.js";

const app = express();

/* =========================================
   API REQUEST / RESPONSE LOGGER
========================================= */

app.use((req, res, next) => {
  const startTime = Date.now();

  console.log("\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("➡️  INCOMING REQUEST");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("METHOD :", req.method);
  console.log("URL    :", req.originalUrl);
  console.log("ORIGIN :", req.headers.origin || "NO ORIGIN");
  console.log("IP     :", req.ip);

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⬅️  RESPONSE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("METHOD :", req.method);
    console.log("URL    :", req.originalUrl);
    console.log("STATUS :", res.statusCode);
    console.log("TIME   :", `${duration}ms`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  });

  next();
});

/* =========================================
   CORS
========================================= */

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🔎 CORS Origin:", origin);

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS allowed:", origin);
        return callback(null, true);
      }

      console.log("❌ CORS rejected:", origin);

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workforce OS API is running",
  });
});

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
