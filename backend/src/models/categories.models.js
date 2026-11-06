import mongoose, { Schema } from "mongoose";

const categoriesSchema = new Schema(
    {
        categories_name: {
            type: String,
            trim: true,
        },

        category_name: {
            type: String,
            trim: true,
        },

        userid: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        type: {
            type: String,
            enum: ["income", "expense", "investment"],
            lowercase: true,
            required: true,
        },

        icon: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

categoriesSchema.pre("validate", function () {
    if (!this.categories_name && this.category_name) {
        this.categories_name = this.category_name;
    }
    if (!this.category_name && this.categories_name) {
        this.category_name = this.categories_name;
    }
    if (!this.categories_name) {
        throw new Error("Category name is required");
    }
});

export const Categories =
    mongoose.models.categories ||
    mongoose.model("categories", categoriesSchema);
