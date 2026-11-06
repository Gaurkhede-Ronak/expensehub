import { Categories } from "../models/categories.models.js";
import { PartyMaster } from "../models/Partymaster.models.js";

export const DEFAULT_CATEGORIES = [
    {
        categories_name: "Salary",
        type: "income",
        icon: "wallet2",
    },
    {
        categories_name: "Freelance",
        type: "income",
        icon: "briefcase",
    },
    {
        categories_name: "Business Profit",
        type: "income",
        icon: "cash-coin",
    },
    {
        categories_name: "Rental Income",
        type: "income",
        icon: "house",
    },
    {
        categories_name: "Investment Returns",
        type: "income",
        icon: "graph-up-arrow",
    },

    {
        categories_name: "Food & Dining",
        type: "expense",
        icon: "cup-hot",
    },
    {
        categories_name: "Groceries",
        type: "expense",
        icon: "basket",
    },
    {
        categories_name: "House Rent",
        type: "expense",
        icon: "house",
    },
    {
        categories_name: "Electricity & Bills",
        type: "expense",
        icon: "lightning-charge",
    },
    {
        categories_name: "Fuel & Petrol",
        type: "expense",
        icon: "fuel-pump",
    },
    {
        categories_name: "Shopping & Clothing",
        type: "expense",
        icon: "bag",
    },
    {
        categories_name: "Medical & Healthcare",
        type: "expense",
        icon: "heart-pulse",
    },
    {
        categories_name: "Education & Courses",
        type: "expense",
        icon: "mortarboard",
    },
    {
        categories_name: "Entertainment & Movies",
        type: "expense",
        icon: "film",
    },
    {
        categories_name: "Travel & Vacation",
        type: "expense",
        icon: "geo-alt",
    },
    {
        categories_name: "Mobile & Internet",
        type: "expense",
        icon: "wifi",
    },

    {
        categories_name: "Mutual Funds",
        type: "investment",
        icon: "graph-up-arrow",
    },
    {
        categories_name: "Stocks & Trading",
        type: "investment",
        icon: "graph-up",
    },
    {
        categories_name: "Fixed Deposit & Savings",
        type: "investment",
        icon: "piggy-bank",
    },
    {
        categories_name: "Gold & Real Estate",
        type: "investment",
        icon: "bank",
    },
];

export const DEFAULT_PARTIES = [
    {
        party_name: "Self / Cash",
        party_type: "person",
        title: "Personal Cash & Wallet",
    },
    {
        party_name: "State Bank of India (SBI)",
        party_type: "bank",
        title: "Primary Savings Account",
    },
    {
        party_name: "HDFC Bank",
        party_type: "bank",
        title: "Secondary Bank Account",
    },
    {
        party_name: "Employer / Company",
        party_type: "company",
        title: "Salary & Professional",
    },
    {
        party_name: "Family Members",
        party_type: "person",
        title: "Household & Relatives",
    },
    {
        party_name: "Local Supermarket",
        party_type: "store",
        title: "Groceries & Supplies",
    },
    {
        party_name: "Landlord",
        party_type: "person",
        title: "House Rental",
    },
    {
        party_name: "Electricity Board",
        party_type: "company",
        title: "Power & Utility Bills",
    },
    {
        party_name: "Fuel Pump Station",
        party_type: "store",
        title: "Vehicle Petrol & Diesel",
    },
    {
        party_name: "Friends & Splits",
        party_type: "person",
        title: "Shared Social Expenses",
    },
];

export const seedDefaultUserData = async (userId) => {
    if (!userId) return;

    try {
        const categoryCount = await Categories.countDocuments({ userid: userId });
        if (categoryCount === 0) {
            const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
                ...cat,
                userid: userId,
            }));
            await Categories.insertMany(categoriesToInsert);
        } else if (categoryCount < DEFAULT_CATEGORIES.length) {
            for (const cat of DEFAULT_CATEGORIES) {
                const exists = await Categories.exists({
                    userid: userId,
                    categories_name: cat.categories_name,
                });
                if (!exists) {
                    await Categories.create({ ...cat, userid: userId });
                }
            }
        }

        const { Transactions } = await import("../models/transactions.models.js");
        const legacyDuplicateNames = ["Self", "Employer", "Family", "General Store"];
        for (const name of legacyDuplicateNames) {
            const legacyParty = await PartyMaster.findOne({
                userid: userId,
                party_name: name,
            });
            if (legacyParty) {
                const isUsed = await Transactions.exists({
                    userid: userId,
                    partyid: legacyParty._id,
                });
                if (!isUsed) {
                    await PartyMaster.deleteOne({ _id: legacyParty._id });
                }
            }
        }

        await PartyMaster.updateMany(
            { userid: userId, party_name: "Fuel Pump" },
            { $set: { party_name: "Fuel Pump Station", party_type: "store", title: "Vehicle Petrol & Diesel" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Utility / Power Board" },
            { $set: { party_name: "Electricity Board", party_type: "company", title: "Power & Utility Bills" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Friends & Colleagues" },
            { $set: { party_name: "Friends & Splits", party_type: "person", title: "Shared Social Expenses" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Family & Home" },
            { $set: { party_name: "Family Members", party_type: "person", title: "Household & Relatives" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Local Supermarket" },
            { $set: { party_type: "store" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Landlord" },
            { $set: { party_type: "person" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Self / Cash" },
            { $set: { party_type: "person" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "State Bank of India (SBI)" },
            { $set: { party_type: "bank" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "HDFC Bank" },
            { $set: { party_type: "bank" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_name: "Employer / Company" },
            { $set: { party_type: "company" } }
        );

        await PartyMaster.updateMany(
            { userid: userId, party_type: "individual" },
            { $set: { party_type: "person" } }
        );
        await PartyMaster.updateMany(
            { userid: userId, party_type: "vendor" },
            { $set: { party_type: "store" } }
        );

        for (const party of DEFAULT_PARTIES) {
            const exists = await PartyMaster.exists({
                userid: userId,
                party_name: party.party_name,
            });
            if (!exists) {
                await PartyMaster.create({ ...party, userid: userId });
            }
        }
    } catch (error) {
        console.error("Error seeding default user data:", error);
    }
};
