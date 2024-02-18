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
  editOtherInfoTable,
  deleteOtherInfoEntry,
  addMember,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware.protect, getMe);
router.route("/create").post(registerUser);
// the above /create api has any use?

router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.put("/update/:memberId", authMiddleware.protect, updateUser);
router.post("/addId/:memberId", authMiddleware.protect, addIdUser);
router.put("/editId/:memberId/:id", authMiddleware.protect, editIdUser);
router.post("/addBussiness/:memberId", authMiddleware.protect, addBussiness);
router.put(
  "/editBussiness/:memberId/:id",
  authMiddleware.protect,
  editBussiness
);
router.post(
  "/addOtherInfoTable/:memberId/:tableName",
  authMiddleware.protect,
  addOtherInfoTable
);
router.put(
  "/editOtherInfoTable/:memberId/:tableName/:id",
  authMiddleware.protect,
  editOtherInfoTable
);
router.delete(
  "/deleteOtherInfoEntry/:memberId/:tableName/:id",
  authMiddleware.protect,
  deleteOtherInfoEntry
);

router.post("/addMember", authMiddleware.protect, addMember);

export default router;
