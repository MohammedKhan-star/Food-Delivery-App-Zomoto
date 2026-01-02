import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import OpenAI from "openai";

let openai;

// ✅ Safe OpenAI init
const getOpenAI = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// 🤖 AI CHAT → AUTO ADD TO CART
export const chatWithAI = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // 1️⃣ Fetch menu from DB
    const menu = await foodModel.find({}, "name _id price");

    // 2️⃣ AI prompt
    const prompt = `
You are a food ordering assistant.

Menu:
${menu.map(item => `${item.name} (id:${item._id})`).join("\n")}

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
    });

    const aiText = completion.choices[0].message.content;
    const aiData = JSON.parse(aiText);

    // 🛒 AUTO ADD TO CART
    if (aiData.intent === "add") {
      const foodItem = menu.find(item =>
        item.name.toLowerCase().includes(aiData.itemName.toLowerCase())
      );

      if (!foodItem) {
        return res.json({ reply: "Item not found in menu." });
      }

      const user = await userModel.findById(userId);
      if (!user.cartData) user.cartData = {};

      for (let i = 0; i < aiData.quantity; i++) {
        user.cartData[foodItem._id] =
          (user.cartData[foodItem._id] || 0) + 1;
      }

      await user.save();

      return res.json({
        reply: `✅ Added ${aiData.quantity} ${foodItem.name} to your cart`,
      });
    }

    // 💬 Normal chat
    return res.json({ reply: aiData.reply });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "AI failed" });
  }
};

// 🛒 MANUAL CART APIs (unchanged but cleaned)

export const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user.cartData) user.cartData = {};

    user.cartData[req.body.itemId] =
      (user.cartData[req.body.itemId] || 0) + 1;

    await user.save();
    res.json({ success: true, message: "Added To Cart" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error Occurred" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (user.cartData?.[req.body.itemId] > 0) {
      user.cartData[req.body.itemId] -= 1;
    }
    await user.save();
    res.json({ success: true, message: "Removed From Cart" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, cartData: user.cartData || {} });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error occurred" });
  }
};
