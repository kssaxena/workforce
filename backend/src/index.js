import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/database.js";
import mongoose from "mongoose";
import { initializeRBAC } from "./modules/rbac/seeds/index.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await initializeRBAC();

    const server = app.listen(PORT, () => {
      console.log("\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 WORKFORCE OS BACKEND");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`PORT     : ${PORT}`);
      console.log(`ENV      : ${process.env.NODE_ENV}`);
      console.log(`CLIENT   : ${process.env.CLIENT_URL}`);
      console.log("DATABASE :", process.env.DB_NAME);
      console.log("STATUS   : RUNNING");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n");
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await mongoose.connection.close();

        console.log("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // process.on("SIGTERM", () => {
    //   server.close(() => {
    //     console.log("Server closed");
    //     process.exit(0);
    //   });
    // });

    // process.on("SIGINT", () => {
    //   server.close(() => {
    //     console.log("Server closed");
    //     process.exit(0);
    //   });
    // });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

startServer();
