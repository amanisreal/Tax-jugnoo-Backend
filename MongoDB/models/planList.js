import mongoose from "mongoose";

const PlanListSchema = new mongoose.Schema(
  {
    planName: { type: String, default: "" },
    planCategory: { type: String, default: "" },
  },
  { timestamps: true }
);

const PlanListModel = mongoose.model("PlanList", PlanListSchema);

export default PlanListModel
