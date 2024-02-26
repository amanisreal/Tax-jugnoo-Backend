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
  deleteBussiness,
  addOtherInfoTable,
  editOtherInfoTable,
  deleteOtherInfoEntry,
  addMember,
  getAllMember,
  getInformationUser,
  deleteIdUser,
  getUserData,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware.protect, getMe);
router.get("/user/:memberId", authMiddleware.protect, getUserData);
router.route("/create").post(registerUser);
router.route("/login").post(loginUser);
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp").post(verifyOtp);
router.put("/update/:memberId", authMiddleware.protect, updateUser);
router.post("/addId/:memberId", authMiddleware.protect, addIdUser);
router.get(
  "/getInformation/:memberId",
  authMiddleware.protect,
  getInformationUser
);
router.put("/editId/:memberId/:id", authMiddleware.protect, editIdUser);
router.delete("/deleteId/:memberId/:id", authMiddleware.protect, deleteIdUser);
router.post("/addBussiness/:memberId", authMiddleware.protect, addBussiness);
router.put(
  "/editBussiness/:memberId/:id",
  authMiddleware.protect,
  editBussiness
);
router.delete(
  "/deleteBussiness/:memberId/:id",
  authMiddleware.protect,
  deleteBussiness
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
router.get("/member", authMiddleware.protect, getAllMember);

export default router;
