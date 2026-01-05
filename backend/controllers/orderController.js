import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config(); 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//placing user order for frontend

const placeOrder=async(req,res)=>{

const frontend_url="http://localhost:3000"

    try {
        const newOrder=new orderModel({
            userId: req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})

        const line_items=req.body.items.map((item)=>({
         price_data:{
            currency:"inr",
            product_data:{
                name:item.name
            },
            unit_amount: item.price * 100

         },
         quantity:item.quantity
        }))
        line_items.push({
        price_data: {
            currency: "inr",   // ✅ Indian Rupees
            product_data: {
            name: "Delivery Charges",
            },
            unit_amount: 50 * 100,   // ✅ ₹10 (multiply by 100 because Stripe wants paise)
        },
        quantity: 1,
        });

        const session =await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:"payment",
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`

        })
        res.json({success:true,session_url:session.url})
    } catch (error) {
        console.error("Stripe Order Error:", error);
        res.json({success:false,message:"Error"})
    }
}

const verifyOrder=async(req,res)=>{
  const {orderId,success}=req.body;
  try {
    if(success==="true"){
        await orderModel.findByIdAndUpdate(orderId,{payment:true})
        res.json({success:true,message:"Paid"})
    }
    else{
        await orderModel.findByIdAndDelete(orderId);
        res.json({success:false,message:"Not Paid"})
    }
  } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    
  }
}
//user orders for frontend
const userOrders=async(req,res)=>{
    try {
       const orders = await orderModel.find({ userId: req.body.userId })
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"geting Error"})

        
    }

}

//listing orders for admin panel
const listOrders =async(req,res)=>{
    try {
        const orders=await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
        
    }
}

//api for updating order status in admin panel
const updateStatus = async (req, res) => {
    
    try {
        const updatedOrder = await orderModel.findByIdAndUpdate(req.body.orderId, { status:req.body.orderId }, { new: true });
        res.json({ success: true,message:"Status Updated",  });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.json({ success: false, message: "Error updating order status" });
    }   
}
const trackOrderInChat = async (orderId) => {
  try {
    const res = await axios.get(`${url}/api/order/track/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data.success) {
      const { status, items, amount, estimatedDelivery } = res.data;

      const itemList = items.map(i => `${i.name} x${i.quantity}`).join("\n");

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `📦 **Order #${orderId}**\n\nItems:\n${itemList}\n\nTotal: ₹${amount}\nStatus: ${status}\nEstimated Delivery: ${estimatedDelivery}`
        }
      ]);
    }
  } catch (err) {
    setMessages(prev => [
      ...prev,
      { role: "assistant", text: "❌ Unable to fetch order status. Check your Order ID." }
    ]);
  }
};


export {placeOrder,userOrders,verifyOrder,listOrders,updateStatus,trackOrderInChat};