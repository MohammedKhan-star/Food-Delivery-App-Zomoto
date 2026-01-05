import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {

  const {token}=req.headers;
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }
  try {
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decoded.id;
    next();
  } catch (err) {
   console.log(err)
   res.json({success:false,message:"Unauthorized access"    })
  } 
};

export default authMiddleware;
