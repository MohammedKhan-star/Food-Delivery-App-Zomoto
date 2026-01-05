import express from "express"
import {addToCart,removeFromCart,getCart,chatWithAI,recommendFood} from '../controllers/cartController.js'
import authMiddleware from "../middleware/auth.js";


const cartRouter =express.Router();
cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart)
cartRouter.post("/get",authMiddleware,getCart)
cartRouter.post("/chat",chatWithAI);
cartRouter.post("/recommend",authMiddleware,recommendFood)

export default cartRouter;
