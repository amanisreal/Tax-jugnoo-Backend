import express from "express";
import {
  createPlanList,
  getAllPlansList,
  updatePlanList,
} from "../controllers/planList.controller.js";

const router = express.Router();

router.route("/add").post(createPlanList);
router.route("/all").get(getAllPlansList);
router.route("/update/:id").put(updatePlanList);

export default router;
