import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import OpenAI from "openai";

/* =======================
   CONFIG
======================= */
const USE_OPENAI = process.env.USE_OPENAI === "true";

/* =======================
   OPENAI CLIENT (SAFE)
======================= */
let openai = null;

if (USE_OPENAI && process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/* =======================
   MAIN AI HANDLER
======================= */
export const chatWithAI = async (req, res) => {
  try {
    // ✅ Use OpenAI ONLY if enabled & available
    if (USE_OPENAI && openai) {
      return openAIAssistant(req, res);
    }

    // ✅ Otherwise fallback to Local AI
    return localAssistant(req, res);

  } catch (error) {
    console.error("AI FALLBACK ERROR:", error.message);
    return localAssistant(req, res);
  }
};

/* =======================
   OPENAI ASSISTANT
======================= */


/* =======================
   LOCAL AI ASSISTANT
======================= */
/* =======================
   LOCAL AI (SMART)
======================= */
const localAssistant = async (req, res) => {
  try {
    const { message, mode, productId } = req.body;

    // 🔹 MODE 1: LIVE SEARCH (typing)
    if (mode === "suggest") {
      const items = await foodModel.find({
        name: { $regex: message, $options: "i" }
      }).select("name price");

      return res.json({
        type: "suggestions",
        items
      });
    }

    // 🔹 MODE 2: PRODUCT CLICK
    if (mode === "detail" && productId) {
      const product = await foodModel.findById(productId);

      return res.json({
        type: "detail",
        product
      });
    }

    return res.json({ type: "empty" });

  } catch (err) {
    console.error("LOCAL AI ERROR:", err);
    res.json({ type: "error" });
  }
};


/* =======================
   CART CONTROLLERS
======================= */
export const addToCart = async (req, res) => {
   try {
    let userData = await userModel.findOne({ _id: req.body.userId });
    let cartData=await userData.cartData;

    if(!cartData[req.body.itemId]){
      cartData[req.body.itemId]=1;
    }else{
      cartData[req.body.itemId]+=1;
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Item added to cart" });

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ success: false ,message:"Could not add to cart" });
  }
};

export const removeFromCart = async (req, res) => {
 try{
    let userData = await userModel.findById({ _id: req.body.userId });
    let cartData=await userData.cartData;

    if(cartData[req.body.itemId]>0){
      cartData[req.body.itemId]-=1;
      if(cartData[req.body.itemId]===0){
        delete cartData[req.body.itemId];
      }
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Item removed from cart" });

 } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);
    res.status(500).json({ success: false, message:"Could not remove from cart" });
 }
};

export const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById({ _id: req.body.userId });
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ success: false, message: "Could not retrieve cart" });
  }
};
