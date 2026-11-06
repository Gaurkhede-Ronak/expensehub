
import { User } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.header("Authorization") || req.header("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader;

    const token =
        req.cookies?.accesstoken ||
        req.cookies?.accessToken ||
        bearerToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decodedToken?._id)
        .select("-password -refreshtoken");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
});

export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.header("Authorization") || req.header("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader;

    const token =
        req.cookies?.accesstoken ||
        req.cookies?.accessToken ||
        bearerToken;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshtoken");
        req.user = user || null;
    } catch {
        req.user = null;
    }

    next();
});
