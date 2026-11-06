import mongoose from "mongoose";
import { Categories } from "../models/categories.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { seedDefaultUserData } from "../utils/seedDefaults.js";

const categoryIconMap = [
    { keywords: ["metro", "subway"], icon: "train-front" },
    { keywords: ["bike fuel", "petrol", "fuel", "diesel"], icon: "fuel-pump" },
    { keywords: ["bike", "bicycle", "cycle"], icon: "bicycle" },
    { keywords: ["car", "taxi", "cab"], icon: "car-front" },
    { keywords: ["bus"], icon: "bus-front" },
    { keywords: ["train", "railway"], icon: "train-front" },
    { keywords: ["transport", "travel"], icon: "geo-alt" },
    { keywords: ["flight", "airplane"], icon: "airplane" },

    { keywords: ["food", "restaurant", "meal"], icon: "cup-hot" },
    { keywords: ["pizza"], icon: "pizza" },
    { keywords: ["coffee", "tea", "chai"], icon: "cup-hot" },
    { keywords: ["grocery", "groceries"], icon: "basket" },
    { keywords: ["shopping", "clothes"], icon: "bag" },
    { keywords: ["vegetable", "fruits"], icon: "basket2" },

    { keywords: ["rent", "house", "home"], icon: "house" },
    { keywords: ["electricity", "light", "power"], icon: "lightning-charge" },
    { keywords: ["water", "water bill"], icon: "droplet" },
    { keywords: ["gas"], icon: "fire" },
    { keywords: ["internet", "wifi"], icon: "wifi" },
    { keywords: ["mobile", "phone", "recharge"], icon: "phone" },

    { keywords: ["education", "school", "college"], icon: "mortarboard" },
    { keywords: ["book", "books"], icon: "book" },
    { keywords: ["course", "tuition"], icon: "journal-bookmark" },

    { keywords: ["medical", "medicine", "health"], icon: "heart-pulse" },
    { keywords: ["hospital"], icon: "hospital" },
    { keywords: ["doctor"], icon: "person-plus" },
    { keywords: ["gym", "fitness"], icon: "activity" },

    { keywords: ["movie", "cinema", "film"], icon: "film" },
    { keywords: ["game", "gaming"], icon: "controller" },
    { keywords: ["music"], icon: "music-note" },

    { keywords: ["salary", "wages", "income"], icon: "wallet2" },
    { keywords: ["business", "freelance"], icon: "briefcase" },
    { keywords: ["commission"], icon: "cash-coin" },

    { keywords: ["investment", "mutual fund"], icon: "graph-up-arrow" },
    { keywords: ["stock", "share", "trading"], icon: "graph-up" },
    { keywords: ["bank", "sbi", "account"], icon: "bank" },
    { keywords: ["insurance", "lic", "life"], icon: "shield-check" },
    { keywords: ["saving", "savings"], icon: "piggy-bank" },
    { keywords: ["loan", "emi"], icon: "cash-stack" },
    { keywords: ["tax"], icon: "receipt" },

    { keywords: ["gift"], icon: "gift" },
    { keywords: ["donation", "charity"], icon: "heart" },
    { keywords: ["pet", "animal"], icon: "paw" },
    { keywords: ["repair", "maintenance"], icon: "tools" },
    { keywords: ["hotel"], icon: "building" },
    { keywords: ["salon", "beauty"], icon: "scissors" },
    { keywords: ["subscription"], icon: "calendar-check" },
];

const defaultIcons = {
    expense: "receipt",
    income: "wallet2",
    investment: "graph-up-arrow",
};

const getCategoryIconUrl = (categoryName, type) => {
    const normalizedName = categoryName
        .toLowerCase()
        .trim()
        .replace(/[_-]/g, " ");

    let selectedIcon = null;

    for (const item of categoryIconMap) {
        const matched = item.keywords.some((keyword) =>
            normalizedName.includes(keyword)
        );

        if (matched) {
            selectedIcon = item.icon;
            break;
        }
    }

    if (!selectedIcon) {
        selectedIcon = defaultIcons[type] || "receipt";
    }

    return selectedIcon;
};

const createCategory = asyncHandler(async (req, res) => {
    const rawName = req.body.category_name || req.body.categories_name;
    const { type } = req.body;

    if (
        typeof rawName !== "string" ||
        !rawName.trim() ||
        typeof type !== "string" ||
        !type.trim()
    ) {
        throw new ApiError(400, "Category name and type are required");
    }

    const name = rawName.trim();
    const normalizedType = type.toLowerCase().trim();

    const allowedTypes = ["expense", "income", "investment"];

    if (!allowedTypes.includes(normalizedType)) {
        throw new ApiError(400, "Invalid category type");
    }

    const icon = getCategoryIconUrl(
        name,
        normalizedType
    );

    const category = await Categories.create({
        categories_name: name,
        category_name: name,
        type: normalizedType,
        icon,
        userid: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});


const getAllCategories = asyncHandler(async (req, res) => {
    let categories = await Categories.find({
        userid: req.user._id,
    }).sort({ createdAt: -1 });

    if (categories.length === 0) {
        await seedDefaultUserData(req.user._id);
        categories = await Categories.find({
            userid: req.user._id,
        }).sort({ createdAt: -1 });
    }

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});


const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid category ID");
    }

    const rawName = req.body.category_name || req.body.categories_name;
    const { type } = req.body;

    const update = {};

    if (rawName !== undefined) {
        if (
            typeof rawName !== "string" ||
            !rawName.trim()
        ) {
            throw new ApiError(400, "Category name cannot be empty");
        }

        const name = rawName.trim();
        update.category_name = name;
        update.categories_name = name;
    }

    if (type !== undefined) {
        if (typeof type !== "string" || !type.trim()) {
            throw new ApiError(400, "Invalid category type");
        }

        const normalizedType = type.toLowerCase().trim();

        if (!["expense", "income", "investment"].includes(normalizedType)) {
            throw new ApiError(400, "Invalid category type");
        }

        update.type = normalizedType;
    }

    if (Object.keys(update).length === 0) {
        throw new ApiError(400, "Provide at least one field to update");
    }

    const existingCategory = await Categories.findOne({
        _id: id,
        userid: req.user._id,
    });

    if (!existingCategory) {
        throw new ApiError(404, "Category not found");
    }

    const finalName =
        update.category_name ||
        existingCategory.category_name ||
        existingCategory.categories_name;

    const finalType =
        update.type || existingCategory.type;

    update.icon = getCategoryIconUrl(finalName, finalType);

    const category = await Categories.findOneAndUpdate(
        {
            _id: id,
            userid: req.user._id,
        },
        {
            $set: update,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});


const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid category ID");
    }

    const category = await Categories.findOneAndDelete({
        _id: id,
        userid: req.user._id,
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category deleted successfully")
    );
});


export {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
