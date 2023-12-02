import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getAllUser,
  registerUser,
  loginUser,
  getMe,
  sendOtp,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware.protect, getMe);
router.route("/create").post(registerUser);
router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOtp);

router.route("/").get(getAllUser);

export default router;
