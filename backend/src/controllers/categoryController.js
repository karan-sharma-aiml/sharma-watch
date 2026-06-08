const Category = require("../models/Category");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendSuccess(res, 200, "Categories fetched successfully.", { categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return sendError(res, 409, "Category with this name already exists.");
    }

    const category = await Category.create({ name, description });
    return sendSuccess(res, 201, "Category created successfully.", { category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 404, "Category not found.");
    }

    return sendSuccess(res, 200, "Category updated successfully.", { category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return sendError(res, 404, "Category not found.");
    }

    return sendSuccess(res, 200, "Category deleted successfully.", {});
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };