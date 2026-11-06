import mongoose from "mongoose";
import { PartyMaster } from "../models/Partymaster.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedPartyTypes = [
    "person",
    "family",
    "customer",
    "supplier",
    "vendor",
    "company",
    "employer",
    "employee",
    "client",
    "store",
    "supermarket",
    "bank",
    "lender",
    "borrower",
    "creditcard",
    "lifeinsurance",
    "vehicleinsurance",
    "healthinsurance",
    "government",
    "hospital",
    "doctor",
    "school",
    "college",
    "landlord",
    "tenant",
    "utility",
    "serviceprovider",
    "broker",
    "investmentfirm",
    "other",
];


const createParty = asyncHandler(async (req, res) => {
    const { party_type, party_name, title } = req.body;

    if (
        typeof party_type !== "string" ||
        !party_type.trim() ||
        typeof party_name !== "string" ||
        !party_name.trim()
    ) {
        throw new ApiError(400, "Party type and party name are required");
    }

    const resolvedTitle =
        typeof title === "string" && title.trim()
            ? title.trim()
            : party_name.trim();

    const normalizedType = party_type.trim().toLowerCase();

    if (!allowedPartyTypes.includes(normalizedType)) {
        throw new ApiError(
            400,
            `Invalid party type. Allowed types: ${allowedPartyTypes.join(", ")}`
        );
    }

    const partyMaster = await PartyMaster.create({
        party_type: normalizedType,
        party_name: party_name.trim(),
        title: resolvedTitle,
        userid: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            partyMaster,
            "Party created successfully"
        )
    );
});


const getAllParty = asyncHandler(async (req, res) => {
    const parties = await PartyMaster.find({
        userid: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            parties,
            "Parties fetched successfully"
        )
    );
});


const getSingleParty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid party ID");
    }

    const party = await PartyMaster.findOne({
        _id: id,
        userid: req.user._id,
    });

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            party,
            "Party fetched successfully"
        )
    );
});


const updateParty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { party_type, party_name, title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid party ID");
    }

    const update = {};

    if (party_type !== undefined) {
        if (
            typeof party_type !== "string" ||
            !party_type.trim()
        ) {
            throw new ApiError(400, "Invalid party type");
        }

        const normalizedType = party_type.trim().toLowerCase();

        if (!allowedPartyTypes.includes(normalizedType)) {
            throw new ApiError(
                400,
                `Invalid party type. Allowed types: ${allowedPartyTypes.join(", ")}`
            );
        }

        update.party_type = normalizedType;
    }

    if (party_name !== undefined) {
        if (
            typeof party_name !== "string" ||
            !party_name.trim()
        ) {
            throw new ApiError(400, "Party name cannot be empty");
        }

        update.party_name = party_name.trim();
    }

    if (title !== undefined) {
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            throw new ApiError(400, "Title cannot be empty");
        }

        update.title = title.trim();
    }

    if (Object.keys(update).length === 0) {
        throw new ApiError(
            400,
            "Provide at least one field to update"
        );
    }

    const party = await PartyMaster.findOneAndUpdate(
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

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            party,
            "Party updated successfully"
        )
    );
});


const deleteparty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid party ID");
    }

    const { Transactions } = await import(
        "../models/transactions.models.js"
    );

    const usedInTransaction = await Transactions.exists({
        userid: req.user._id,
        $or: [{ party_id: id }, { partyid: id }],
    });

    if (usedInTransaction) {
        throw new ApiError(
            400,
            "This party is used in transactions. Remove or reassign those transactions first."
        );
    }

    const party = await PartyMaster.findOneAndDelete({
        _id: id,
        userid: req.user._id,
    });

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            party,
            "Party deleted successfully"
        )
    );
});


const deleteParty = deleteparty;
const getAllParties = getAllParty;

export {
    createParty,
    getAllParty,
    getAllParties,
    getSingleParty,
    updateParty,
    deleteparty,
    deleteParty,
};