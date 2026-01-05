import express from "express";
import fs from "fs";
import multer from "multer";

import FoodModel from "../models/foodModel.js";
import { addFood ,listFood,removeFood} from "../controllers/foodController.js";

const foodRouter = express.Router();

// Ensure 'uploads' directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Image storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename to avoid collisions
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  }
});

// Optional: Filter to only accept image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed"));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});



// Route to add food
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", async (req, res) => {
  try {
    const foods = await FoodModel.find({});
    const updatedFoods = foods.map(food => ({
      ...food._doc,
      image: `${req.protocol}://${req.get("host")}/uploads/${food.image}`
    }));
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ success: false, message: "Error fetching foods" });
  }
});

foodRouter.post("/remove",removeFood)


export default foodRouter;
