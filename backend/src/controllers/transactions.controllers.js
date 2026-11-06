
import mongoose from "mongoose";
import { Transactions } from "../models/transactions.models.js";
import { Categories } from "../models/categories.models.js";
import { PartyMaster } from "../models/Partymaster.models.js";
import { Budgets } from "../models/budgets.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedTypes = ["expense", "income", "investment"];

const createTransaction = asyncHandler(async (req, res) => {
    const categoriesid = req.body.categoriesid || req.body.categoryid;
    const party_id = req.body.party_id || req.body.partyid;
    const {
        type,
        title,
        amount,
        date,
        description
    } = req.body;

    if (
        !categoriesid ||
        !party_id ||
        !type ||
        !title?.trim() ||
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        throw new ApiError(400, "All required fields are needed");
    }

    if (
        typeof type !== "string" ||
        !allowedTypes.includes(type.toLowerCase())
    ) {
        throw new ApiError(400, "Invalid transaction type");
    }

    if (
        !mongoose.Types.ObjectId.isValid(categoriesid) ||
        !mongoose.Types.ObjectId.isValid(party_id)
    ) {
        throw new ApiError(400, "Invalid category or party ID");
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        throw new ApiError(400, "Invalid transaction amount");
    }

    const category = await Categories.findOne({
        _id: categoriesid,
        userid: req.user._id
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    const party = await PartyMaster.findOne({
        _id: party_id,
        userid: req.user._id
    });

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    const transactionDate = date ? new Date(date) : new Date();

    if (Number.isNaN(transactionDate.getTime())) {
        throw new ApiError(400, "Invalid transaction date");
    }

    const transaction = await Transactions.create({
        userid: req.user._id,
        categoriesid,
        party_id,
        type: type.toLowerCase(),
        title: title.trim(),
        amount: numericAmount,
        date: transactionDate,
        description
    });

    let budgetAlert = null;
    if (type.toLowerCase() === "expense") {
        const year = transactionDate.getFullYear();
        const monthNum = String(transactionDate.getMonth() + 1).padStart(2, "0");
        const monthStr = `${year}-${monthNum}`;

        const budget = await Budgets.findOne({
            userid: req.user._id,
            categoryid: categoriesid,
            month: monthStr,
        });

        if (budget) {
            const startOfMonth = new Date(year, transactionDate.getMonth(), 1);
            const endOfMonth = new Date(year, transactionDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const expenses = await Transactions.aggregate([
                {
                    $match: {
                        userid: req.user._id,
                        categoriesid: new mongoose.Types.ObjectId(categoriesid),
                        type: "expense",
                        date: { $gte: startOfMonth, $lte: endOfMonth },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" },
                    },
                },
            ]);

            const totalExpense = expenses[0]?.total || 0;
            if (totalExpense > budget.amount) {
                const categoryName = category.category_name || category.categories_name || "Category";
                budgetAlert = {
                    exceeded: true,
                    categoryName,
                    budgetAmount: budget.amount,
                    spentAmount: totalExpense,
                    difference: totalExpense - budget.amount,
                    message: `Your budget for ${categoryName} was ₹${budget.amount.toLocaleString("en-IN")}, but total expense reached ₹${totalExpense.toLocaleString("en-IN")}!`,
                };
            }
        }
    }

    const populatedTransaction = await Transactions.findById(transaction._id)
        .populate("categoriesid", "category_name categories_name icon type")
        .populate("party_id", "party_name party_type title");

    return res.status(201).json(
        new ApiResponse(
            201,
            { ...(populatedTransaction ? populatedTransaction.toObject() : transaction.toObject()), budgetAlert },
            "Transaction created successfully"
        )
    );
});


const getAllTransactions = asyncHandler(async (req, res) => {

    const filter = {
        userid: req.user._id
    };

    if (req.query.type) {
        const type = req.query.type.toLowerCase();

        if (!allowedTypes.includes(type)) {
            throw new ApiError(400, "Invalid transaction type");
        }

        filter.type = type;
    }

    const transactions = await Transactions.find(filter)
        .populate("categoriesid", "category_name categories_name icon type")
        .populate("party_id", "party_name party_type title")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            transactions,
            "Transactions fetched successfully"
        )
    );
});


const getSingleTransaction = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transactions.findOne({
        _id: id,
        userid: req.user._id
    })
        .populate("categoriesid", "category_name categories_name icon type")
        .populate("party_id", "party_name party_type title");

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Transaction fetched successfully"
        )
    );
});


const updateTransaction = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const categoriesid = req.body.categoriesid || req.body.categoryid;
    const party_id = req.body.party_id || req.body.partyid;
    const {
        type,
        title,
        amount,
        date,
        description
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transactions.findOne({
        _id: id,
        userid: req.user._id
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    if (categoriesid !== undefined) {

        if (!mongoose.Types.ObjectId.isValid(categoriesid)) {
            throw new ApiError(400, "Invalid category ID");
        }

        const category = await Categories.findOne({
            _id: categoriesid,
            userid: req.user._id
        });

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        transaction.categoriesid = categoriesid;
    }

    if (party_id !== undefined) {

        if (!mongoose.Types.ObjectId.isValid(party_id)) {
            throw new ApiError(400, "Invalid party ID");
        }

        const party = await PartyMaster.findOne({
            _id: party_id,
            userid: req.user._id
        });

        if (!party) {
            throw new ApiError(404, "Party not found");
        }

        transaction.party_id = party_id;
    }

    if (type !== undefined) {

        if (
            typeof type !== "string" ||
            !allowedTypes.includes(type.toLowerCase())
        ) {
            throw new ApiError(400, "Invalid transaction type");
        }

        transaction.type = type.toLowerCase();
    }

    if (title !== undefined) {

        if (typeof title !== "string" || !title.trim()) {
            throw new ApiError(400, "Title cannot be empty");
        }

        transaction.title = title.trim();
    }

    if (amount !== undefined) {

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            throw new ApiError(400, "Invalid amount");
        }

        transaction.amount = numericAmount;
    }

    if (date !== undefined) {

        const transactionDate = new Date(date);

        if (Number.isNaN(transactionDate.getTime())) {
            throw new ApiError(400, "Invalid transaction date");
        }

        transaction.date = transactionDate;
    }

    if (description !== undefined) {
        transaction.description = description;
    }

    await transaction.save();

    let budgetAlert = null;
    if (transaction.type === "expense") {
        const transDate = new Date(transaction.date);
        const year = transDate.getFullYear();
        const monthNum = String(transDate.getMonth() + 1).padStart(2, "0");
        const monthStr = `${year}-${monthNum}`;

        const budget = await Budgets.findOne({
            userid: req.user._id,
            categoryid: transaction.categoriesid,
            month: monthStr,
        });

        if (budget) {
            const startOfMonth = new Date(year, transDate.getMonth(), 1);
            const endOfMonth = new Date(year, transDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const expenses = await Transactions.aggregate([
                {
                    $match: {
                        userid: req.user._id,
                        categoriesid: new mongoose.Types.ObjectId(transaction.categoriesid),
                        type: "expense",
                        date: { $gte: startOfMonth, $lte: endOfMonth },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" },
                    },
                },
            ]);

            const totalExpense = expenses[0]?.total || 0;
            if (totalExpense > budget.amount) {
                const category = await Categories.findById(transaction.categoriesid);
                const categoryName = category?.category_name || category?.categories_name || "Category";
                budgetAlert = {
                    exceeded: true,
                    categoryName,
                    budgetAmount: budget.amount,
                    spentAmount: totalExpense,
                    difference: totalExpense - budget.amount,
                    message: `Your budget for ${categoryName} was ₹${budget.amount.toLocaleString("en-IN")}, but total expense reached ₹${totalExpense.toLocaleString("en-IN")}!`,
                };
            }
        }
    }

    const populatedTransaction = await Transactions.findById(transaction._id)
        .populate("categoriesid", "category_name categories_name icon type")
        .populate("party_id", "party_name party_type title");

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...(populatedTransaction ? populatedTransaction.toObject() : transaction.toObject()), budgetAlert },
            "Transaction updated successfully"
        )
    );
});


const deleteTransaction = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transactions.findOneAndDelete({
        _id: id,
        userid: req.user._id
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Transaction deleted successfully"
        )
    );
});


export {
    createTransaction,
    getAllTransactions,
    getSingleTransaction,
    updateTransaction,
    deleteTransaction
};
