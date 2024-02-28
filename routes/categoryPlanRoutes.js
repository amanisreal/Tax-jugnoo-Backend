import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  createCategoryPlan,
  getAllCategoryPlans,
  updateCategoryPlan,
} from "../controllers/categoryPlan.controller.js";

const router = express.Router();

router.route("/add").post(createCategoryPlan);
router.route("/all").get(getAllCategoryPlans);
router.route("/update/:id").put(updateCategoryPlan);

export default router;
