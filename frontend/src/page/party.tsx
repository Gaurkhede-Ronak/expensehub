import { useEffect, useMemo, useState } from "react";

import {
    Badge,
    Button,
    Card,
    Form,
    InputGroup,
    Spinner,
    Table,
} from "react-bootstrap";

import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import CommonModal from "../components/common/CommonModal";
import { CustomSelect, type SelectOption } from "../components/common/CustomSelect";
import ReusableFormModal, {
    type FormField,
} from "../components/common/ReusableFormModal";

import {
    getAllPartiesThunk,
    createPartyThunk,
    updatePartyThunk,
    deletePartyThunk,
    setSelectedParty,
    clearSelectedParty,
    clearPartyError,
} from "../features/party/partySlice";

import type {
    Party,
    PartyPayload,
    PartyType,
} from "../features/party/partyTypes";

const initialForm: PartyPayload = {
    party_type: "person",
    party_name: "",
    title: "",
};

const partyFields: FormField[] = [
    {
        name: "party_name",
        label: "Party Name",
        type: "text",
        placeholder: "Enter party name",
        required: true,
        col: 6,
    },
    {
        name: "party_type",
        label: "Party Type",
        type: "select",
        required: true,
        col: 6,
        options: [
            { label: "Person", value: "person", color: "#38bdf8" },
            { label: "Family", value: "family", color: "#60a5fa" },
            { label: "Customer", value: "customer", color: "#818cf8" },
            { label: "Supplier", value: "supplier", color: "#a78bfa" },
            { label: "Vendor", value: "vendor", color: "#c084fc" },
            { label: "Company", value: "company", color: "#a855f7" },
            { label: "Employer", value: "employer", color: "#9333ea" },
            { label: "Employee", value: "employee", color: "#c026d3" },
            { label: "Client", value: "client", color: "#db2777" },
            { label: "Store", value: "store", color: "#f59e0b" },
            { label: "Supermarket", value: "supermarket", color: "#d97706" },
            { label: "Bank", value: "bank", color: "#10b981" },
            { label: "Lender", value: "lender", color: "#059669" },
            { label: "Borrower", value: "borrower", color: "#14b8a6" },
            { label: "Credit Card", value: "creditcard", color: "#06b6d4" },
            { label: "Life Insurance", value: "lifeinsurance", color: "#ec4899" },
            { label: "Vehicle Insurance", value: "vehicleinsurance", color: "#f43f5e" },
            { label: "Health Insurance", value: "healthinsurance", color: "#22c55e" },
            { label: "Government", value: "government", color: "#ef4444" },
            { label: "Hospital", value: "hospital", color: "#10b981" },
            { label: "Doctor", value: "doctor", color: "#14b8a6" },
            { label: "School", value: "school", color: "#3b82f6" },
            { label: "College", value: "college", color: "#6366f1" },
            { label: "Landlord", value: "landlord", color: "#eab308" },
            { label: "Tenant", value: "tenant", color: "#ca8a04" },
            { label: "Utility", value: "utility", color: "#0ea5e9" },
            { label: "Service Provider", value: "serviceprovider", color: "#8b5cf6" },
            { label: "Broker", value: "broker", color: "#f97316" },
            { label: "Investment Firm", value: "investmentfirm", color: "#2563eb" },
            { label: "Other", value: "other", color: "#64748b" },
        ],
    },
    {
        name: "title",
        label: "Title / Description",
        type: "text",
        placeholder: "e.g. Salary Account or Landlord",
        required: true,
        col: 12,
    },
];

const PartyPage = () => {
    const dispatch = useAppDispatch();

    const {
        parties,
        selectedParty,
        loading,
        error,
    } = useAppSelector((state) => state.party);

    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const [formData, setFormData] =
        useState<PartyPayload>(initialForm);

    useEffect(() => {
        dispatch(getAllPartiesThunk());
    }, [dispatch]);

    const filteredParties = useMemo(() => {
        const q = search.trim().toLowerCase();
        return parties.filter((party) => {
            const matchesSearch =
                !q ||
                (party.party_name || "").toLowerCase().includes(q) ||
                (party.title || "").toLowerCase().includes(q) ||
                (party.party_type || "").toLowerCase().includes(q);

            const matchesType =
                typeFilter === "all" || party.party_type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [parties, search, typeFilter]);

    const handleOpenAdd = () => {
        dispatch(clearSelectedParty());
        dispatch(clearPartyError());

        setFormData(initialForm);
        setShowModal(true);
    };

    const handleEdit = (party: Party) => {
        dispatch(setSelectedParty(party));
        dispatch(clearPartyError());

        setFormData({
            party_type: party.party_type,
            party_name: party.party_name,
            title: party.title,
        });

        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);

        dispatch(clearSelectedParty());
        dispatch(clearPartyError());

        setFormData(initialForm);
    };

    const handleChange = (name: string, value: string) => {
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            if (selectedParty) {
                await dispatch(
                    updatePartyThunk({
                        id: selectedParty._id,
                        data: formData,
                    })
                ).unwrap();
                toast.success("Party updated successfully");
            } else {
                await dispatch(
                    createPartyThunk(formData)
                ).unwrap();
                toast.success("Party created successfully");
            }

            handleClose();
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to save party");
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        dispatch(clearPartyError());

        try {
            setDeleteLoading(true);
            await dispatch(deletePartyThunk(deleteId)).unwrap();
            toast.success("Party deleted successfully");
            setDeleteId(null);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to delete party");
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatPartyType = (type: PartyType | string) => {
        const labels: Record<string, string> = {
            person: "Person",
            family: "Family",
            customer: "Customer",
            supplier: "Supplier",
            vendor: "Vendor",
            company: "Company",
            employer: "Employer",
            employee: "Employee",
            client: "Client",
            store: "Store",
            supermarket: "Supermarket",
            bank: "Bank",
            lender: "Lender",
            borrower: "Borrower",
            creditcard: "Credit Card",
            lifeinsurance: "Life Insurance",
            vehicleinsurance: "Vehicle Insurance",
            healthinsurance: "Health Insurance",
            government: "Government",
            hospital: "Hospital",
            doctor: "Doctor",
            school: "School",
            college: "College",
            landlord: "Landlord",
            tenant: "Tenant",
            utility: "Utility",
            serviceprovider: "Service Provider",
            broker: "Broker",
            investmentfirm: "Investment Firm",
            other: "Other",
        };

        const key = (type || "").toLowerCase().trim();
        return labels[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "Person");
    };

    const getBadgeBg = (type: PartyType | string) => {
        switch (type) {
            case "company":
            case "employer":
            case "investmentfirm":
                return "primary";
            case "bank":
            case "creditcard":
            case "lender":
                return "info";
            case "store":
            case "supermarket":
            case "vendor":
            case "supplier":
                return "warning";
            case "lifeinsurance":
            case "vehicleinsurance":
            case "healthinsurance":
            case "hospital":
            case "doctor":
                return "success";
            case "government":
            case "school":
            case "college":
                return "danger";
            default:
                return "secondary";
        }
    };

    const partyTypeOptions: SelectOption[] = [
        { value: "all", label: "All Types", color: "#94a3b8" },
        { value: "person", label: "Person", color: "#38bdf8" },
        { value: "family", label: "Family", color: "#60a5fa" },
        { value: "customer", label: "Customer", color: "#818cf8" },
        { value: "supplier", label: "Supplier", color: "#a78bfa" },
        { value: "vendor", label: "Vendor", color: "#c084fc" },
        { value: "company", label: "Company", color: "#a855f7" },
        { value: "employer", label: "Employer", color: "#9333ea" },
        { value: "employee", label: "Employee", color: "#c026d3" },
        { value: "client", label: "Client", color: "#db2777" },
        { value: "store", label: "Store", color: "#f59e0b" },
        { value: "supermarket", label: "Supermarket", color: "#d97706" },
        { value: "bank", label: "Bank", color: "#10b981" },
        { value: "lender", label: "Lender", color: "#059669" },
        { value: "borrower", label: "Borrower", color: "#14b8a6" },
        { value: "creditcard", label: "Credit Card", color: "#06b6d4" },
        { value: "lifeinsurance", label: "Life Insurance", color: "#ec4899" },
        { value: "vehicleinsurance", label: "Vehicle Insurance", color: "#f43f5e" },
        { value: "healthinsurance", label: "Health Insurance", color: "#22c55e" },
        { value: "government", label: "Government", color: "#ef4444" },
        { value: "hospital", label: "Hospital", color: "#10b981" },
        { value: "doctor", label: "Doctor", color: "#14b8a6" },
        { value: "school", label: "School", color: "#3b82f6" },
        { value: "college", label: "College", color: "#6366f1" },
        { value: "landlord", label: "Landlord", color: "#eab308" },
        { value: "tenant", label: "Tenant", color: "#ca8a04" },
        { value: "utility", label: "Utility", color: "#0ea5e9" },
        { value: "serviceprovider", label: "Service Provider", color: "#8b5cf6" },
        { value: "broker", label: "Broker", color: "#f97316" },
        { value: "investmentfirm", label: "Investment Firm", color: "#2563eb" },
        { value: "other", label: "Other", color: "#64748b" },
    ];

    return (
        <div className="party-page">

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Party Master</h3>
                    <p className="text-muted mb-0">
                        Manage your companies, banks, people and stores.
                    </p>
                </div>

                <Button onClick={handleOpenAdd}>
                    <FiPlus className="me-2" />
                    Add Party
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <h5 className="fw-semibold mb-0 text-nowrap">
                                All Parties
                            </h5>
                            <span
                                className="badge rounded-pill"
                                style={{
                                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                                    color: "#60a5fa",
                                    border: "1px solid rgba(59, 130, 246, 0.25)",
                                    fontSize: "12px",
                                    padding: "4px 9px",
                                }}
                            >
                                {filteredParties.length !== parties.length
                                    ? `${filteredParties.length} of ${parties.length}`
                                    : parties.length}
                            </span>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto align-items-stretch">
                            <InputGroup
                                className="search-input-group flex-grow-1"
                                style={{ minWidth: 220, maxWidth: "100%" }}
                            >
                                <InputGroup.Text>
                                    <FiSearch />
                                </InputGroup.Text>

                                <Form.Control
                                    placeholder="Search party..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />

                                {search && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary d-flex align-items-center"
                                        onClick={() => setSearch("")}
                                        style={{
                                            borderColor: "var(--input-border)",
                                            background: "var(--input-bg)",
                                            color: "var(--text-secondary)",
                                        }}
                                        aria-label="Clear search"
                                    >
                                        <FiX size={15} />
                                    </button>
                                )}
                            </InputGroup>

                            <div style={{ minWidth: "175px" }}>
                                <CustomSelect
                                    value={typeFilter}
                                    onChange={setTypeFilter}
                                    options={partyTypeOptions}
                                    ariaLabel="Filter parties by type"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {loading && parties.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <Table hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Party Name</th>
                                            <th>Title</th>
                                            <th>Party Type</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredParties.length > 0 ? (
                                            filteredParties.map((party, index) => (
                                                <tr key={party._id}>
                                                    <td>{index + 1}</td>

                                                    <td className="fw-semibold">
                                                        {party.party_name}
                                                    </td>

                                                    <td>{party.title}</td>

                                                    <td>
                                                        <Badge
                                                            bg={getBadgeBg(
                                                                party.party_type
                                                            )}
                                                            className="px-2 py-1 fw-medium"
                                                        >
                                                            {formatPartyType(
                                                                party.party_type
                                                            )}
                                                        </Badge>
                                                    </td>

                                                    <td className="text-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="me-2"
                                                            onClick={() =>
                                                                handleEdit(party)
                                                            }
                                                            disabled={loading}
                                                        >
                                                            <FiEdit2 />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() =>
                                                                handleDelete(party._id)
                                                            }
                                                            disabled={loading}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center text-muted py-4"
                                                >
                                                    {search.trim() ? (
                                                        <div>
                                                            <FiSearch size={22} className="mb-2 opacity-50" />
                                                            <p className="mb-0">
                                                                No parties found matching "<strong>{search}</strong>"
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "No parties found."
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-md-none">
                                {filteredParties.length > 0 ? (
                                    filteredParties.map((party, index) => {
                                        const isLast = index === filteredParties.length - 1;

                                        return (
                                            <div
                                                key={party._id}
                                                className={`py-3 ${!isLast ? "border-bottom" : ""}`}
                                                style={{ borderColor: "var(--border)" }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="me-2 text-truncate">
                                                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: "15px" }}>
                                                            {party.party_name}
                                                        </div>
                                                        <div className="text-muted small mt-1 text-truncate" style={{ fontSize: "13px" }}>
                                                            {party.title}
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        <Badge
                                                            bg={getBadgeBg(party.party_type)}
                                                            className="px-2 py-1 fw-medium"
                                                        >
                                                            {formatPartyType(party.party_type)}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-end gap-2 mt-2 pt-2 border-top" style={{ borderColor: "rgba(34, 50, 75, 0.4)" }}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleEdit(party)}
                                                        disabled={loading}
                                                        style={{ fontSize: "12px" }}
                                                    >
                                                        <FiEdit2 size={13} />
                                                        <span>Edit</span>
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleDelete(party._id)}
                                                        disabled={loading}
                                                        style={{ fontSize: "12px" }}
                                                    >
                                                        <FiTrash2 size={13} />
                                                        <span>Delete</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        {search.trim() ? (
                                            <div>
                                                <FiSearch size={22} className="mb-2 opacity-50" />
                                                <p className="mb-0">
                                                    No parties found matching "<strong>{search}</strong>"
                                                </p>
                                            </div>
                                        ) : (
                                            "No parties found."
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            <ReusableFormModal
                show={showModal}
                title={
                    selectedParty ? "Edit Party" : "Add Party"
                }
                fields={partyFields}
                values={formData}
                loading={loading}
                error={error}
                submitText={
                    selectedParty ? "Update Party" : "Create Party"
                }
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

            <CommonModal
                show={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Party"
                confirmText="Delete"
                confirmVariant="danger"
                loading={deleteLoading}
            >
                <p className="mb-0 text-secondary">
                    Are you sure you want to delete this party? This action cannot be undone.
                </p>
            </CommonModal>
        </div>
    );
};

export default PartyPage;
