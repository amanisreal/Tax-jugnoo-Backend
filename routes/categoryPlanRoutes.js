import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  createCategoryPlan,
  getAllCategoryPlans,
} from "../controllers/categoryPlan.controller.js";

const router = express.Router();

// router.post("/add", createCategoryPlan);

router.route("/add").post(createCategoryPlan);
router.route("/all").get(getAllCategoryPlans);

export default router;
