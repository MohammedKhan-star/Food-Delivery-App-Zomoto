import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import Stripe from "stripe";

import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";
dotenv.config(); // ✅ MUST be first line

// App config
const app = express();
const port = process.env.PORT || 4000;

// DB (ONLY ONE CONNECTION)
connectDB(process.env.MONGO_URI);

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("uploads"));

// Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working ✅");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
