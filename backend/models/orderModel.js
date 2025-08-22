import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String } // optional
    }
  ],
  amount: { type: Number, required: true },
  address: {
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String
  },
  status: { type: String, default: "pending" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false }
});


const orderModel=mongoose.models.order || mongoose.model("order",orderSchema)
export default orderModel;
