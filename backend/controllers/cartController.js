import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import OpenAI from "openai";

/* =======================
   OPENAI SETUP
======================= */
let openai;

const getOpenAI = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

/* =======================
   AI CHAT
======================= */
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    console.log("AI USER:", userId);

    const menu = await foodModel.find({}, "name _id price");

    const prompt = `
You are a food ordering assistant.

Menu items:
${menu.map(item => item.name).join(", ")}

User message: "${message}"

If user wants to add food, reply ONLY in JSON:
{
  "intent": "add",
  "itemName": "Burger",
  "quantity": 2
}

Otherwise reply:
{
  "intent": "chat",
  "reply": "your message"
}
`;

    const ai = getOpenAI();

    const completion = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    });

    const aiData = JSON.parse(completion.choices[0].message.content);

    if (aiData.intent === "add") {
      const foodItem = menu.find(item =>
        item.name.toLowerCase().includes(aiData.itemName.toLowerCase())
      );

      if (!foodItem) {
        return res.json({ reply: "Item not found in menu." });
      }

      const user = await userModel.findById(userId);
      if (!user.cartData) user.cartData = {};

      user.cartData[foodItem._id] =
        (user.cartData[foodItem._id] || 0) + aiData.quantity;

      await user.save();

      return res.json({
        reply: ` Added ${aiData.quantity} ${foodItem.name} to your cart`
      });
    }

    return res.json({ reply: aiData.reply });

  } catch (error) {
    console.error("AI Error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        reply: "⚠️ AI is busy. Please try again later."
      });
    }

    res.status(500).json({ reply: "AI failed" });
  }
};

/* =======================
   CART CONTROLLERS
======================= */
export const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user.cartData) user.cartData = {};

    user.cartData[req.body.itemId] =
      (user.cartData[req.body.itemId] || 0) + 1;

    await user.save();
    res.json({ success: true, message: "Added To Cart" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (user.cartData?.[req.body.itemId] > 0) {
      user.cartData[req.body.itemId] -= 1;
    }

    await user.save();
    res.json({ success: true, message: "Removed From Cart" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    res.json({ success: true, cartData: user.cartData || {} });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
