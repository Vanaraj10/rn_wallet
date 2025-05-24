import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";
// Load environment variables from .env file
dotenv.config();

const app = express();

if(process.env.NODE_ENV === "production") {
  // Start the cron job if in production
  job.start();
}

app.use(rateLimiter);
// Middleware to parse JSON requests
app.use(express.json());

app.get("/api/health",(req,res)=>{
  res.status(200).json({ message: "API is healthy" });
});

app.use("/api/transactions",transactionsRoute); // Use transactions route

initDB().then(() => {
  app.listen(5001, () => {
    console.log("Server is running on port 5001");
  });
});
