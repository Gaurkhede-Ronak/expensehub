import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    badge?: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    ariaLabel?: string;
    dropUp?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className = "",
    style,
    disabled = false,
    ariaLabel = "Select option",
    dropUp,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropUp, setIsDropUp] = useState(false);
    const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const modalBody =
            (containerRef.current.closest(".modal-body") as HTMLElement | null) ||
            (containerRef.current.closest(".modal-content") as HTMLElement | null);

        let modalSpaceBelow = spaceBelow;
        let modalSpaceAbove = spaceAbove;

        if (modalBody) {
            const mRect = modalBody.getBoundingClientRect();
            modalSpaceBelow = mRect.bottom - rect.bottom;
            modalSpaceAbove = rect.top - mRect.top;
        }

        const estimatedHeight = Math.min(options.length * 40 + 16, 230);

        let shouldDropUp = dropUp ?? false;
        if (dropUp === undefined) {
            if (modalBody) {
                if (modalSpaceBelow < estimatedHeight && modalSpaceAbove >= 90) {
                    shouldDropUp = true;
                } else if (modalSpaceBelow < 120 && modalSpaceAbove > modalSpaceBelow) {
                    shouldDropUp = true;
                }
            } else {
                if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
                    shouldDropUp = true;
                }
            }
        }

        setIsDropUp(shouldDropUp);

        if (shouldDropUp) {
            const calculatedMaxHeight = Math.min(
                estimatedHeight,
                Math.max(modalBody ? modalSpaceAbove - 12 : spaceAbove - 20, 120),
                240
            );
            setMenuStyles({
                position: "fixed",
                bottom: `${Math.round(window.innerHeight - rect.top + 6)}px`,
                left: `${Math.round(rect.left)}px`,
                width: `${Math.round(rect.width)}px`,
                maxHeight: `${calculatedMaxHeight}px`,
                zIndex: 99999,
            });
        } else {
            const calculatedMaxHeight = Math.min(
                estimatedHeight,
                Math.max(spaceBelow - 16, 120),
                240
            );
            setMenuStyles({
                position: "fixed",
                top: `${Math.round(rect.bottom + 6)}px`,
                left: `${Math.round(rect.left)}px`,
                width: `${Math.round(rect.width)}px`,
                maxHeight: `${calculatedMaxHeight}px`,
                zIndex: 99999,
            });
        }
    }, [dropUp, options.length]);

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        updatePosition();

        const handleScrollOrResize = () => {
            updatePosition();
        };

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, updatePosition]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={`custom-select-wrapper ${className}`}
            style={{ position: "relative", ...style }}
        >
            <button
                type="button"
                className={`custom-select-trigger ${isOpen ? "is-open" : ""}`}
                onClick={toggleOpen}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="custom-select-label-wrap">
                    {selectedOption && (
                        <span
                            className="custom-select-dot"
                            style={{ backgroundColor: selectedOption.color || "#38bdf8" }}
                        />
                    )}
                    {selectedOption?.icon && (
                        <span className="custom-select-icon">
                            {selectedOption.icon}
                        </span>
                    )}
                    <span className="custom-select-label">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </span>

                <FiChevronDown
                    className={`custom-select-chevron ${isOpen ? "open" : ""}`}
                    size={16}
                />
            </button>

            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={`custom-select-dropdown ${isDropUp ? "drop-up" : ""}`}
                        style={menuStyles}
                        role="listbox"
                        aria-label={ariaLabel}
                    >
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`custom-select-option ${
                                        isSelected ? "is-selected" : ""
                                    }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className="custom-select-option-left">
                                        <span
                                            className="custom-select-dot"
                                            style={{
                                                backgroundColor: option.color || "#38bdf8",
                                            }}
                                        />
                                        {option.icon && (
                                            <span className="custom-select-icon">
                                                {option.icon}
                                            </span>
                                        )}
                                        <span className="custom-select-option-text">
                                            {option.label}
                                        </span>
                                    </span>

                                    {isSelected && (
                                        <FiCheck
                                            className="custom-select-check"
                                            size={15}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </div>
    );
};
