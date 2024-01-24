import asyncHandler from "express-async-handler";
import PlanList from "../MongoDB/models/planList.js";

// @desc    Create a new categoryPlan
// @route   POST /category/add
// @access  Public
const createPlanList = asyncHandler(async (req, res) => {
  const { planName, planCategory } = req.body;

  if (!planName || !planCategory) {
    return res
      .status(400)
      .json({ error: "Please add all required fields", status: false });
  }

  const categoryPlan = await PlanList.create({
    planName,
    planCategory,
  });

  return res.status(201).json({
    data: categoryPlan,
    status: true,
    message: "Plan list created successfully",
  });
});

// @desc    Get all category plans
// @route   GET /category/all
// @access  Public

// const getAllCategoryPlans = asyncHandler(async (req, res) => {
//   const categoryPlans = await CategoryPlan.find({});
//   return res.status(200).json({
//     data: categoryPlans,
//     count: categoryPlans?.length,
//     status: true,
//     message: "All Category Plans retrieved successfully",
//   });
// });
const getAllPlansList = asyncHandler(async (req, res) => {
  const { searchQuery } = req.query;

  // Build a search query if provided
  const query = {};
  if (searchQuery) {
    query.$or = [
      { planName: { $regex: searchQuery, $options: "i" } },
      { planCategory: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const categoryPlans = await PlanList.find(query);

  return res.status(200).json({
    data: categoryPlans,
    status: true,
    message: "All  Plans list retrieved successfully",
  });
});

// @desc    Update a category plan by ID
// @route   PUT /category/update/:id
// @access  Public
const updatePlanList = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const { planName, planCategory } = req.body;

  if (!planName || !planCategory) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields", status: false });
  }

  const updatedPlanList = await PlanList.findByIdAndUpdate(
    categoryId,
    {
      planName,
      planCategory,
    },
    { new: true }
  );

  if (!updatedPlanList) {
    return res.status(404).json({
      error: " Plan List not found",
      status: false,
    });
  }

  return res.status(200).json({
    data: updatedPlanList,
    status: true,
    message: " Plan List updated successfully",
  });
});

export {
  createPlanList,
  getAllPlansList,
  updatePlanList,

  // Add other controller functions here...
};
