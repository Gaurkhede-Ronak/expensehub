import mongoose, { Schema } from "mongoose";

const budgetsSchema = new Schema(
    {
        userid: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: true
        },

        categoryid: {
            type: mongoose.Types.ObjectId,
            ref: "categories",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        month: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Budgets = mongoose.model("budgets", budgetsSchema);