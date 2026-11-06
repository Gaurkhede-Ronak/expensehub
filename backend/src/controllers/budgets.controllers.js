import mongoose from "mongoose";
import { Budgets } from "../models/budgets.models.js";
import { Categories } from "../models/categories.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createBudget = asyncHandler(async (req, res) => {
    const { categoryid, amount, month } = req.body;

    if (!categoryid || amount === undefined || !month?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryid)) {
        throw new ApiError(400, "Invalid category ID");
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new ApiError(400, "Amount must be greater than 0");
    }

    const category = await Categories.findOne({
        _id: categoryid,
        userid: req.user._id
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    const budget = await Budgets.create({
        userid: req.user._id,
        categoryid,
        amount: numericAmount,
        month: month.trim()
    });

    const populatedBudget = await Budgets.findById(budget._id).populate(
        "categoryid",
        "category_name categories_name icon type"
    );

    return res.status(201).json(
        new ApiResponse(201, populatedBudget, "Budget created successfully")
    );
});

const getAllBudgets = asyncHandler(async (req, res) => {
    const budgets = await Budgets.find({
        userid: req.user._id
    })
        .populate("categoryid", "category_name categories_name icon type")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, budgets, "Budgets fetched successfully")
    );
});

const getSingleBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid budget ID");
    }

    const budget = await Budgets.findOne({
        _id: id,
        userid: req.user._id
    }).populate("categoryid", "category_name categories_name icon type");

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    return res.status(200).json(
        new ApiResponse(200, budget, "Budget fetched successfully")
    );
});

const updateBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { categoryid, amount, month } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid budget ID");
    }

    const updates = {};

    if (categoryid !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(categoryid)) {
            throw new ApiError(400, "Invalid category ID");
        }

        const category = await Categories.findOne({
            _id: categoryid,
            userid: req.user._id
        });

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        updates.categoryid = categoryid;
    }

    if (amount !== undefined) {
        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            throw new ApiError(400, "Amount must be greater than 0");
        }

        updates.amount = numericAmount;
    }

    if (month !== undefined) {
        if (typeof month !== "string" || !month.trim()) {
            throw new ApiError(400, "Invalid month");
        }

        updates.month = month.trim();
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "Provide at least one field to update");
    }

    const budget = await Budgets.findOneAndUpdate(
        {
            _id: id,
            userid: req.user._id
        },
        {
            $set: updates
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("categoryid", "category_name categories_name icon type");

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    return res.status(200).json(
        new ApiResponse(200, budget, "Budget updated successfully")
    );
});

const deleteBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid budget ID");
    }

    const budget = await Budgets.findOneAndDelete({
        _id: id,
        userid: req.user._id
    });

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    return res.status(200).json(
        new ApiResponse(200, budget, "Budget deleted successfully")
    );
});

export {
    createBudget,
    getAllBudgets,
    getSingleBudget,
    updateBudget,
    deleteBudget
};
