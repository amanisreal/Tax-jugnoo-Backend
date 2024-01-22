import mongoose from "mongoose";

const CategoryPlanSchema = new mongoose.Schema(
  {
    categoryName: { type: String, default: "" },
    hoverLine: { type: String, default: "" },
    pageHeadline: { type: String, default: "" },
    pageParagraph: { type: String, default: "" },
    serviceTemplate: { type: String, default: "" },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const categoryPlanModel = mongoose.model("CategoryPlan", CategoryPlanSchema);

export default categoryPlanModel;
