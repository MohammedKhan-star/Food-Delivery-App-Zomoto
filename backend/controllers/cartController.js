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
    if (USE_OPENAI && openai) {
      return openAIAssistant(req, res);
    }
    return localAssistant(req, res);
  } catch (error) {
    console.error("AI FALLBACK ERROR:", error.message);
    return localAssistant(req, res);
  }
};


/* =======================
   🧠 OPENAI ASSISTANT
======================= */
const openAIAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    // 🔹 Load food menu for GPT context
    const menu = await foodModel.find({}, "name price category");

    const systemPrompt = `
You are a smart, friendly food ordering assistant for a food delivery app.

Your abilities:
- Suggest food items from the menu
- Answer naturally like a human
- Help users order food step by step
- Explain Stripe payment issues
- Provide customer support details

Menu:
${menu.map(item => `• ${item.name} (₹${item.price})`).join("\n")}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.6
    });

    const reply = completion.choices[0].message.content;

    return res.json({
      type: "text",
      reply
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error.message);
    return localAssistant(req, res); // 🔁 fallback
  }
};

/* =======================
   🤖 LOCAL AI (SMART FALLBACK)
======================= */
const localAssistant = async (req, res) => {
  try {
    const { message, mode, productId } = req.body;
    const text = message?.toLowerCase() || "";

    /* 🔹 LIVE SEARCH */
    if (mode === "suggest") {
      const items = await foodModel.find({
        name: { $regex: message, $options: "i" }
      }).select("name price image");

      return res.json({ type: "suggestions", items });
    }
    if (text.includes("track order") || text.includes("my order")) {
  const orderIdMatch = text.match(/#?(\w{24})/); // capture orderId if user types #123...
  if (orderIdMatch) {
    return trackOrderInChat(orderIdMatch[1]);
  }

  return res.json({
    type: "text",
    reply: `
📦 **Track Your Order**
Please provide your Order ID (e.g., #63f5a2b1e4c123456789abcd) and I will fetch the status.
`
  });
}


    /* 🔹 PRODUCT DETAIL */
    if (mode === "detail" && productId) {
      const product = await foodModel.findById(productId);
      return res.json({ type: "detail", product });
    }

    /* 🔹 HOW TO ORDER */
    if (text.includes("how to order") || text.includes("order food")) {
      return res.json({
        type: "text",
        reply: `
🛒 **How to Order Food**

1️⃣ Browse food items  
2️⃣ Add items to cart  
3️⃣ Open cart & checkout  
4️⃣ Enter address  
5️⃣ Pay using Stripe  
6️⃣ Order confirmed 🎉
`
      });
    }

    /* 🔹 PAYMENT HELP */
    if (text.includes("payment") || text.includes("stripe")) {
      return res.json({
        type: "text",
        reply: `
💳 **Payment Help**

✔️ Card / UPI supported  
✔️ Stable internet required  
✔️ Do not refresh page  

📧 Support: mohammedkhan20019@gmail.com
`
      });
    }

    /* 🔹 SUPPORT */
    if (text.includes("help") || text.includes("support")) {
      return res.json({
        type: "text",
        reply: `
📞 **Customer Support**

📧 mohammedkhan20019@gmail.com  
🕒 10 AM – 7 PM
`
      });
    }

    /* 🔹 DEFAULT */
    return res.json({
      type: "text",
      reply: `
👋 Hi! I can help with:
🍔 Food suggestions
🛒 Ordering steps
💳 Payment help
📦 Order tracking
`
    });

  } catch (err) {
    console.error("LOCAL AI ERROR:", err);
    return res.json({
      type: "error",
      reply: "Something went wrong. Please try again."
    });
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

export const recommendFood = async (req, res) => {
  try {
    const { message } = req.body;
    const text = message.toLowerCase();

    let query = {};

    /* 🔥 INTENT DETECTION */
    if (text.includes("spicy")) query.tags = "spicy";
    if (text.includes("veg")) query.tags = "veg";
    if (text.includes("healthy")) query.tags = "healthy";
    if (text.includes("cheap") || text.includes("low budget"))
      query.price = { $lte: 150 };

    if (text.includes("pizza")) query.category = "pizza";
    if (text.includes("burger")) query.category = "burger";

    /* 🔍 DATABASE SEARCH */
    const items = await foodModel
      .find(query)
      .sort({ rating: -1 })
      .limit(5)
      .select("name price image rating tags");

    /* 🧠 FALLBACK */
    if (!items.length) {
      const fallback = await foodModel
        .find()
        .sort({ rating: -1 })
        .limit(5);

      return res.json({
        type: "recommendation",
        reason: "Top rated dishes you might love",
        items: fallback
      });
    }

    /* 🎯 SMART RESPONSE */
    return res.json({
      type: "recommendation",
      reason: `Recommended based on your preference`,
      items
    });

  } catch (err) {
    console.error(err);
    res.json({
      type: "error",
      reply: "Unable to recommend food right now."
    });
  }
};
