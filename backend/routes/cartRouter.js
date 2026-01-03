import express from "express"
import {addToCart,removeFromCart,getCart,chatWithAI} from '../controllers/cartController.js'
import authMiddleware from "../middleware/auth.js";


const cartRouter =express.Router();
cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart)
cartRouter.post("/get",authMiddleware,getCart)
cartRouter.post("/chat", authMiddleware, chatWithAI);
export default cartRouter;
