import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRouter.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRouter.js";
import orderRouter from "./routes/orderRouter.js";

// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Connect DB
connectDB(process.env.MONGO_URI);

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images",express.static('uploads'));
app.use("/api/user",userRouter)
app.use('/api/cart',cartRouter)
app.use("/api/order",orderRouter)

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
