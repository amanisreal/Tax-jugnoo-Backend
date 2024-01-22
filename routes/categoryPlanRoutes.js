import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import { createCategoryPlan } from "../controllers/categoryPlan.controller.js";

const router = express.Router();

router.post("/add", authMiddleware.protect, createCategoryPlan);

export default router;
