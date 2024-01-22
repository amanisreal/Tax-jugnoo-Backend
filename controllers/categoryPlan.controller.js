import asyncHandler from "express-async-handler";
import CategoryPlan from "../MongoDB/models/categoryPlan.js";

// @desc    Create a new categoryPlan
// @route   POST /categoryPlan/create
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

// Other controller functions...

export {
  createCategoryPlan,
  // Add other controller functions here...
};
