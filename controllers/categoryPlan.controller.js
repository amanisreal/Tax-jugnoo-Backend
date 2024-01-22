import asyncHandler from "express-async-handler";
import CategoryPlan from "../MongoDB/models/categoryPlan.js";

// @desc    Create a new categoryPlan
// @route   POST /category/add
// @access  Public
const createCategoryPlan = asyncHandler(async (req, res) => {
  const {
    categoryName,
    hoverLine,
    pageHeadline,
    pageParagraph,
    serviceTemplate,
    active,
  } = req.body;

  if (
    !categoryName ||
    !hoverLine ||
    !pageHeadline ||
    !pageParagraph ||
    !serviceTemplate ||
    active === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Please add all required fields", status: false });
  }

  const categoryPlan = await CategoryPlan.create({
    categoryName,
    hoverLine,
    pageHeadline,
    pageParagraph,
    serviceTemplate,
    active,
  });

  return res.status(201).json({
    data: categoryPlan,
    status: true,
    message: "Category Plan created successfully",
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
const getAllCategoryPlans = asyncHandler(async (req, res) => {
  const { searchQuery } = req.query;

  // Build a search query if provided
  const query = {};
  if (searchQuery) {
    query.$or = [
      { categoryName: { $regex: searchQuery, $options: "i" } },
      { hoverLine: { $regex: searchQuery, $options: "i" } },
      { pageHeadline: { $regex: searchQuery, $options: "i" } },
      { pageParagraph: { $regex: searchQuery, $options: "i" } },
      { serviceTemplate: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const categoryPlans = await CategoryPlan.find(query);

  return res.status(200).json({
    data: categoryPlans,
    status: true,
    message: "All Category Plans retrieved successfully",
  });
});

// @desc    Update a category plan by ID
// @route   PUT /category/update/:id
// @access  Public
const updateCategoryPlan = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const {
    categoryName,
    hoverLine,
    pageHeadline,
    pageParagraph,
    serviceTemplate,
    active,
  } = req.body;

  if (
    !categoryName ||
    !hoverLine ||
    !pageHeadline ||
    !pageParagraph ||
    !serviceTemplate ||
    active === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields", status: false });
  }

  const updatedCategoryPlan = await CategoryPlan.findByIdAndUpdate(
    categoryId,
    {
      categoryName,
      hoverLine,
      pageHeadline,
      pageParagraph,
      serviceTemplate,
      active,
    },
    { new: true }
  );

  if (!updatedCategoryPlan) {
    return res.status(404).json({
      error: "Category Plan not found",
      status: false,
    });
  }

  return res.status(200).json({
    data: updatedCategoryPlan,
    status: true,
    message: "Category Plan updated successfully",
  });
});

export {
  createCategoryPlan,
  getAllCategoryPlans,
  updateCategoryPlan,

  // Add other controller functions here...
};
