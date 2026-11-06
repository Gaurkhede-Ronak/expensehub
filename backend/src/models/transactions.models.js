import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const transactionsSchema = new Schema(
    {
        userid: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: true
        },

        categoriesid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            required: true
        },

        party_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "partymaster",
            required: true
        },

        type: {
            type: String,
            enum: ["income", "expense", "investment"],
            required: true
        },

        title: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        date: {
            type: Date,
            default: Date.now,
            required: true
        },

        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export const Transactions =
    mongoose.models.transactions ||
    mongoose.model("transactions", transactionsSchema);