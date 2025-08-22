import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://food-delivery-app-zomoto-frontend1.onrender.com";

  try {
    // Create new order
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // Clear user cart
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Prepare Stripe line items
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Stripe expects amount in paise
      },
      quantity: item.quantity,
    }));

    // Add delivery charges
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 50 * 100, // ✅ ₹50 delivery charge
      },
      quantity: 1,
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe Order Error:", error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// verifying payment
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed - order deleted" });
    }
  } catch (error) {
    console.log("Verify Order Error:", error);
    res.json({ success: false, message: "Error verifying order" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log("User Orders Error:", error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// listing all orders for admin
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log("List Orders Error:", error);
    res.json({ success: false, message: "Error listing orders" });
  }
};

// api for updating order status in admin panel
const updateStatus = async (req, res) => {
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.body.orderId,
      { status: req.body.status }, // ✅ fix: update status properly
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Status Updated", data: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.json({ success: false, message: "Error updating order status" });
  }
};

export { placeOrder, userOrders, verifyOrder, listOrders, updateStatus };
