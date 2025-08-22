import foodModel from "../models/foodModel.js"; // Import the model at the top
import fs from "fs";
const addFood = async (req, res) => {
  try {
    let image_filename = req.file ? req.file.filename : "default.jpg";

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: image_filename,
      category: req.body.category,
    });

    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};

const listFood =async(req,res)=>{
  try{
    const foods = await foodModel.find();
    res.json({success:true,data:foods});
  }catch(error){
    console.log(error)
    res.json({success:false,message:"Error"})
  }
}
//remove food item
const removeFood = async (req, res) => {
  try {
    const foodId = req.body.id;

    console.log("🗑️ Remove request for ID:", foodId);

    // 1. Check if ID is provided
    if (!foodId) {
      return res.status(400).json({ success: false, message: "Food ID required" });
    }

    // 2. Find the food
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    // 3. Delete image (only if it exists)
    const imagePath = `uploads/${food.image}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.warn("⚠️ Image not found, skipping delete:", imagePath);
      } else {
        console.log("🖼️ Deleted image:", imagePath);
      }
    });

    // 4. Delete food from DB
    await foodModel.findByIdAndDelete(foodId);

    res.json({ success: true, message: "Food removed successfully" });
  } catch (error) {
    console.error("❌ Error removing food:", error);
    res.status(500).json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };


