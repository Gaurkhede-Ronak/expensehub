export type PartyType =
    | "person"
    | "family"
    | "customer"
    | "supplier"
    | "vendor"
    | "company"
    | "employer"
    | "employee"
    | "client"
    | "store"
    | "supermarket"
    | "bank"
    | "lender"
    | "borrower"
    | "creditcard"
    | "lifeinsurance"
    | "vehicleinsurance"
    | "healthinsurance"
    | "government"
    | "hospital"
    | "doctor"
    | "school"
    | "college"
    | "landlord"
    | "tenant"
    | "utility"
    | "serviceprovider"
    | "broker"
    | "investmentfirm"
    | "other";
 
export interface Party {
    _id: string;
    party_type: PartyType;
    party_name: string;
    title: string;
    userid: string;
    createdAt?: string;
    updatedAt?: string;
}
 
export interface PartyPayload {
    party_type: PartyType;
    party_name: string;
    title: string;
}
 
export interface PartyApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}
 
export interface PartyState {
    parties: Party[];
    selectedParty: Party | null;
    loading: boolean;
    error: string | null;
}