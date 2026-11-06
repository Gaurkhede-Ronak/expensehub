import jwt from "jsonwebtoken";

import { User } from "../models/users.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookiesOption } from "../constants.js";
import { seedDefaultUserData } from "../utils/seedDefaults.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accesstoken = user.generateAccessToken();
        const refreshtoken = user.generateRefreshToken();

        user.refreshtoken = refreshtoken;

        await user.save({
            validateBeforeSave: false,
        });

        return { accesstoken, refreshtoken };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error.message || "Failed to generate tokens"
        );
    }
};

const register = asyncHandler(async (req, res) => {
    const rawName = req.body.name || req.body.userName || req.body.username;
    const { email, password } = req.body;

    if (
        typeof rawName !== "string" ||
        !rawName.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = rawName.trim();

    const existedUser = await User.findOne({
        email: normalizedEmail,
    });

    if (existedUser) {
        throw new ApiError(409, "User already registered");
    }

    const user = await User.create({
        name: cleanName,
        username: cleanName,
        email: normalizedEmail,
        password,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering user"
        );
    }

    await seedDefaultUserData(createdUser._id);

    const { accesstoken, refreshtoken } =
        await generateAccessAndRefreshToken(createdUser._id);

    const safeUser = {
        _id: createdUser._id,
        name: cleanName,
        username: cleanName,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
    };

    return res
        .status(201)
        .cookie("accesstoken", accesstoken, cookiesOption)
        .cookie("refreshtoken", refreshtoken, cookiesOption)
        .json(
            new ApiResponse(
                201,
                {
                    user: safeUser,
                    accesstoken,
                    refreshtoken,
                },
                "User registered successfully"
            )
        );
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ApiError(400, "Email and password are required");
    }

    const existedUser = await User.findOne({
        email: email.trim().toLowerCase(),
    });

    if (!existedUser) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid =
        await existedUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    await seedDefaultUserData(existedUser._id);

    const { accesstoken, refreshtoken } =
        await generateAccessAndRefreshToken(existedUser._id);

    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshtoken"
    );

    const displayName =
        loggedInUser.name ||
        loggedInUser.username ||
        loggedInUser.email.split("@")[0];

    if (!loggedInUser.name || !loggedInUser.username) {
        await User.findByIdAndUpdate(loggedInUser._id, {
            name: displayName,
            username: displayName,
        });
    }

    const safeUser = {
        ...loggedInUser.toObject(),
        name: displayName,
        username: displayName,
    };

    return res
        .status(200)
        .cookie("accesstoken", accesstoken, cookiesOption)
        .cookie("refreshtoken", refreshtoken, cookiesOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: safeUser,
                    accesstoken,
                    refreshtoken,
                },
                "User logged in successfully"
            )
        );
});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshtoken: 1,
            },
        }
    );

    return res
        .status(200)
        .clearCookie("accesstoken", cookiesOption)
        .clearCookie("refreshtoken", cookiesOption)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshtoken || req.body?.refreshtoken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshtoken) {
            throw new ApiError(401, "Refresh token expired or invalid");
        }

        const { accesstoken, refreshtoken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accesstoken", accesstoken, cookiesOption)
            .cookie("refreshtoken", refreshtoken, cookiesOption)
            .json(
                new ApiResponse(
                    200,
                    {
                        accesstoken,
                        refreshtoken,
                    },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            401,
            error.message || "Invalid or expired refresh token"
        );
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        return res.status(200).json(
            new ApiResponse(200, null, "User not authenticated")
        );
    }

    const user = await User.findById(req.user._id).select(
        "-password -refreshtoken"
    );

    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, null, "User not found")
        );
    }

    const displayName =
        user.name || user.username || user.email.split("@")[0];

    if (!user.name || !user.username) {
        await User.findByIdAndUpdate(user._id, {
            name: displayName,
            username: displayName,
        });
    }

    await seedDefaultUserData(user._id);

    const safeUser = {
        ...user.toObject(),
        name: displayName,
        username: displayName,
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            safeUser,
            "User fetched successfully"
        )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (
        typeof oldPassword !== "string" ||
        !oldPassword ||
        typeof newPassword !== "string" ||
        !newPassword
    ) {
        throw new ApiError(
            400,
            "Old password and new password are required"
        );
    }

    if (oldPassword === newPassword) {
        throw new ApiError(
            400,
            "New password must be different from old password"
        );
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    user.refreshtoken = undefined;

    await user.save({
        validateBeforeSave: true,
    });

    return res
        .status(200)
        .clearCookie("accesstoken", cookiesOption)
        .clearCookie("refreshtoken", cookiesOption)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully. Please log in with your new password."
            )
        );
});

export {
    register,
    login,
    logout,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
};
