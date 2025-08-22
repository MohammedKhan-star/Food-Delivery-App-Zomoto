import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token; // or req.headers['authorization']

    if (!token) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
