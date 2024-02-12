import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  // getAllUser,
  registerUser,
  loginUser,
  getMe,
  sendOtp,
  verifyOtp,
  updateUser,
  addIdUser,
  editIdUser,
  addBussiness,
  editBussiness,
  addOtherInfoTable,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware.protect, getMe);
router.route("/create").post(registerUser);
// the above /create api has any use?

router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.put("/update", authMiddleware.protect, updateUser);
router.post("/addId", authMiddleware.protect, addIdUser);
router.put("/editId/:id", authMiddleware.protect, editIdUser);
router.post("/addBussiness", authMiddleware.protect, addBussiness);
router.put("/editBussiness/:id", authMiddleware.protect, editBussiness);
router.post(
  "/addOtherInfoTable/:tableName",
  authMiddleware.protect,
  addOtherInfoTable
);
// router.route("/").get(getAllUser);

export default router;
