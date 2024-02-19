import pkg from "jsonwebtoken";
const { verify } = pkg;
import asyncHandler from "express-async-handler";
import User from "../MongoDB/models/profile/user.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header

      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      console.log(error);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not Authorized , No Token Found" });
  }
});

export default { protect };
