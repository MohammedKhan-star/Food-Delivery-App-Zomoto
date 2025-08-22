import mongoose from "mongoose";

export const connectDB=async ()=>{
    await mongoose.connect('mongodb+srv://mohammedkhan20019:Ux0Yc6vfWjs6Ivoc@cluster0.noujv2a.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}