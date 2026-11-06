import { useState, useMemo, useRef, useEffect } from "react";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiX,
  FiGrid,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Form, InputGroup, Badge } from "react-bootstrap";

import { useAppSelector } from "../../app/hooks";
import "../../style/topbar.css";

interface TopbarProps {
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  type: "page" | "category" | "party" | "transaction";
}

const Topbar = ({ onToggleSidebar, onLogout }: TopbarProps) => {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { transactions } = useAppSelector((state) => state.transaction);
  const { budgets } = useAppSelector((state) => state.budget);
  const { categories } = useAppSelector((state) => state.category);
  const { parties } = useAppSelector((state) => state.party);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName =
    user?.name?.trim() || (user as any)?.userName?.trim() || "User";

  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";

  const allNotifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      type: "alert" | "success" | "info";
    }> = [];

    budgets.forEach((b) => {
      const bCatId =
        typeof b.categoryid === "object" && b.categoryid !== null
          ? (b.categoryid as any)._id
          : b.categoryid;

      const catExpenses = transactions
        .filter((t) => {
          const tCatId =
            typeof t.categoriesid === "object" && t.categoriesid !== null
              ? (t.categoriesid as any)._id
              : t.categoryid || t.categoriesid;
          return t.type === "expense" && tCatId === bCatId;
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const catObj = categories.find((c) => c._id === bCatId);
      const catName =
        (typeof b.categoryid === "object" && b.categoryid !== null
          ? (b.categoryid as any).category_name || (b.categoryid as any).categories_name
          : null) ||
        catObj?.category_name ||
        (catObj as any)?.categories_name ||
        "Category";

      if (b.amount > 0 && catExpenses >= b.amount) {
        list.push({
          id: `budget-over-${b._id}`,
          title: "Budget Exceeded",
          message: `${catName} expenses (₹${catExpenses.toLocaleString("en-IN")}) exceeded budget limit of ₹${Number(b.amount).toLocaleString("en-IN")}.`,
          time: "Alert",
          type: "alert",
        });
      } else if (b.amount > 0 && catExpenses >= b.amount * 0.8) {
        list.push({
          id: `budget-warn-${b._id}`,
          title: "Budget Alert",
          message: `${catName} is at ${Math.round((catExpenses / b.amount) * 100)}% of your monthly budget.`,
          time: "Warning",
          type: "alert",
        });
      }
    });

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedTransactions.forEach((t) => {
      list.push({
        id: `tx-${t._id}`,
        title:
          t.type === "income"
            ? "Income Received"
            : t.type === "expense"
            ? "Expense Logged"
            : "Investment Added",
        message: `${t.title || "Transaction"} for ₹${Number(t.amount).toLocaleString("en-IN")}`,
        time: t.date ? new Date(t.date).toLocaleDateString("en-IN") : "Recent",
        type: t.type === "income" ? "success" : "info",
      });
    });

    if (user?.name || (user as any)?.userName) {
      list.push({
        id: "welcome-notice",
        title: `Welcome, ${user?.name || (user as any)?.userName}!`,
        message: "Your financial dashboard is synced and active.",
        time: "Today",
        type: "info",
      });
    }

    return list;
  }, [budgets, transactions, categories, user]);

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("expensehub_read_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const notifications = useMemo(() => {
    return allNotifications.filter((item) => !readIds.includes(item.id));
  }, [allNotifications, readIds]);

  const handleMarkAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem("expensehub_read_notifications", JSON.stringify(updated));
    } catch (error) {
      void error;
    }
  };

  const handleMarkSingleAsRead = (id: string) => {
    const updated = Array.from(new Set([...readIds, id]));
    setReadIds(updated);
    try {
      localStorage.setItem("expensehub_read_notifications", JSON.stringify(updated));
    } catch (error) {
      void error;
    }
  };

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    const pages = [
      { id: "p-dashboard", title: "Dashboard", subtitle: "Overview, charts and financial statistics", path: "/dashboard" },
      { id: "p-transactions", title: "Transactions", subtitle: "All income, expense and investment records", path: "/transactions" },
      { id: "p-categories", title: "Categories", subtitle: "Manage all expense, income & investment tags", path: "/categories" },
      { id: "p-parties", title: "Party Master", subtitle: "People, companies, banks and stores", path: "/parties" },
      { id: "p-budgets", title: "Budgets", subtitle: "Monthly budgets and category spending targets", path: "/budgets" },
      { id: "p-profile", title: "My Profile", subtitle: "Personal user account details", path: "/profile" },
      { id: "p-settings", title: "Settings", subtitle: "Security and password settings", path: "/settings" },
    ];

    pages.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          path: p.path,
          type: "page",
        });
      }
    });

    categories.forEach((c) => {
      const name = c.category_name || (c as any).categories_name || "";
      const type = c.type || "";
      if (name.toLowerCase().includes(q) || type.toLowerCase().includes(q)) {
        results.push({
          id: `cat-${c._id}`,
          title: name,
          subtitle: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : "General"} Category`,
          path: "/categories",
          type: "category",
        });
      }
    });

    parties.forEach((p) => {
      const name = p.party_name || "";
      const title = p.title || "";
      const type = p.party_type || "";
      if (
        name.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q)
      ) {
        results.push({
          id: `prt-${p._id}`,
          title: name,
          subtitle: `${title ? `${title} • ` : ""}${type ? type.charAt(0).toUpperCase() + type.slice(1) : "Party"}`,
          path: "/parties",
          type: "party",
        });
      }
    });

    transactions.forEach((t) => {
      const title = t.title || "";
      const amountStr = String(t.amount || "");
      const desc = t.description || "";
      if (
        title.toLowerCase().includes(q) ||
        amountStr.includes(q) ||
        desc.toLowerCase().includes(q)
      ) {
        results.push({
          id: `tx-${t._id}`,
          title: title || "Transaction",
          subtitle: `₹${Number(t.amount).toLocaleString("en-IN")} • ${t.type}`,
          path: "/transactions",
          type: "transaction",
        });
      }
    });

    return results;
  }, [search, categories, parties, transactions]);

  const handleSelectSearchResult = (path: string) => {
    navigate(path);
    setSearch("");
    setIsSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearch("");
    setIsSearchOpen(false);
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Menu"
        >
          <FiMenu size={20} />
        </button>

        <div className="topbar-search-wrapper" ref={searchContainerRef}>
          <InputGroup className="topbar-search">
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>

            <Form.Control
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (search.trim()) setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsSearchOpen(false);
              }}
            />

            {search && (
              <span
                className="topbar-search-clear"
                onClick={handleClearSearch}
                role="button"
                aria-label="Clear search"
              >
                <FiX size={15} />
              </span>
            )}
          </InputGroup>

          {isSearchOpen && search.trim() && (
            <div className="topbar-search-results">
              {searchResults.length > 0 ? (
                <>
                  <div className="search-section-header">
                    Found {searchResults.length} {searchResults.length === 1 ? "Result" : "Results"}
                  </div>

                  {searchResults.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => handleSelectSearchResult(item.path)}
                    >
                      <div className={`search-item-icon ${item.type}`}>
                        {item.type === "page" && <FiGrid />}
                        {item.type === "category" && <FiTag />}
                        {item.type === "party" && <FiUsers />}
                        {item.type === "transaction" && <FaIndianRupeeSign />}
                      </div>

                      <div className="flex-grow-1 text-truncate">
                        <div className="search-item-title text-truncate">
                          {item.title}
                        </div>
                        <div className="search-item-subtitle text-truncate">
                          {item.subtitle}
                        </div>
                      </div>

                      <span
                        className={`search-item-badge badge ${
                          item.type === "page"
                            ? "bg-primary"
                            : item.type === "category"
                            ? "bg-success"
                            : item.type === "party"
                            ? "bg-warning text-dark"
                            : "bg-info"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="search-empty-state">
                  <FiSearch size={24} className="mb-2 opacity-50" />
                  <div>
                    No content found matching "<strong>{search}</strong>"
                  </div>
                  <div className="text-muted small mt-1">
                    Try searching for pages, categories, parties or transactions
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="notification-btn"
            id="notification-dropdown"
            aria-label="Notifications"
          >
            <FiBell size={19} />
            {notifications.length > 0 && (
              <span className="notification-dot" />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="notification-dropdown-menu shadow border-0 p-0">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light rounded-top">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold fs-6">Notifications</span>
                {notifications.length > 0 && (
                  <Badge bg="primary" pill>
                    {notifications.length}
                  </Badge>
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none p-0 text-primary fw-medium"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="notification-item p-3 border-bottom d-flex align-items-start justify-content-between gap-2"
                  >
                    <div className="d-flex gap-2 flex-grow-1 text-truncate">
                      <div className="notification-icon-wrapper mt-1">
                        {item.type === "alert" ? (
                          <FiAlertTriangle className="text-warning" size={17} />
                        ) : item.type === "success" ? (
                          <FiTrendingUp className="text-success" size={17} />
                        ) : item.title.includes("Expense") ? (
                          <FiTrendingDown className="text-danger" size={17} />
                        ) : (
                          <FiCheckCircle className="text-primary" size={17} />
                        )}
                      </div>

                      <div className="flex-grow-1 text-truncate">
                        <div className="d-flex justify-content-between align-items-baseline">
                          <strong className="fs-7 text-dark text-truncate">{item.title}</strong>
                          <span className="notification-time text-muted ms-2 flex-shrink-0">{item.time}</span>
                        </div>
                        <p className="notification-msg mb-0 text-secondary text-truncate">{item.message}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted p-0 opacity-50 hover-opacity-100 flex-shrink-0"
                      title="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkSingleAsRead(item.id);
                      }}
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <FiCheckCircle size={24} className="mb-2 text-success opacity-75" />
                  <p className="mb-0 small">All caught up! No unread notifications.</p>
                </div>
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="profile-pill-btn"
            id="profile-dropdown"
          >
            <div className="profile-pill-avatar">{avatarLetter}</div>

            <span className="profile-pill-name">{displayName}</span>

            <FiChevronDown size={16} className="profile-pill-chevron" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow border-0 mt-2 py-2">
            <div className="px-3 py-2 border-bottom mb-1">
              <strong className="d-block text-dark">{displayName}</strong>
              <small className="text-muted d-block text-truncate" style={{ maxWidth: 180 }}>
                {user?.email || "Personal"}
              </small>
            </div>

            <Dropdown.Item as={Link} to="/profile" className="py-2">
              <FiUser className="me-2 text-primary" />
              My Profile
            </Dropdown.Item>

            <Dropdown.Item as={Link} to="/settings" className="py-2">
              <FiSettings className="me-2 text-primary" />
              Settings
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item onClick={onLogout} className="py-2 text-danger">
              <FiLogOut className="me-2" />
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;
