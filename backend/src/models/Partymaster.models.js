import mongoose, { Schema } from "mongoose";

const PartyMasterSchema = new Schema(
    {
        userid: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        party_type: {
    type: String,
    required: true,
    enum: [
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
        "other"
    ]
},

        party_name: {
            type: String,
            required: true,
            trim: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const PartyMaster =
    mongoose.models.partymaster ||
    mongoose.model("partymaster", PartyMasterSchema);
