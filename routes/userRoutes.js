import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getAllUser,
  registerUser,
  loginUser,
  getMe,
  sendOtp,
  verifyOtp,
  updateUser,
  addIdUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware.protect, getMe);
router.route("/create").post(registerUser);
router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.put("/update", authMiddleware.protect, updateUser);
router.post("/addId", authMiddleware.protect, addIdUser);
router.put("/editId", authMiddleware.protect, addIdUser);
router.route("/").get(getAllUser);

export default router;
