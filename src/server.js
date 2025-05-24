import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(rateLimiter);
// Middleware to parse JSON requests
app.use(express.json());

app.use("/api/transactions",transactionsRoute); // Use transactions route

initDB().then(() => {
  app.listen(5001, () => {
    console.log("Server is running on port 5001");
  });
});
