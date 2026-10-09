import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Search,
  RotateCcw,
  Check,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, CONDITION_GRADES } from "../data/mockData";
import ListingCard from "../components/ListingCard";
import ConditionModal from "../components/ConditionModal";
import "../styles/browse.css";

// Hook to close dropdown on click outside
function useOutsideClick(ref, handler, isOpen) {
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isOpen) return;
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        savedHandler.current?.();
      }
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, isOpen]);
}

// Reusable horizontal dropdown button
function FilterDropdown({ label, count = 0, isActive = false, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

  return (
    <div className={`hfb-dropdown ${isActive ? "hfb-dropdown--active" : ""} ${isOpen ? "hfb-dropdown--open" : ""} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="hfb-dropdown__btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="hfb-dropdown__label">{label}</span>
        {count > 0 && <span className="hfb-dropdown__badge">{count}</span>}
        <ChevronDown className={`hfb-dropdown__chevron ${isOpen ? "hfb-dropdown__chevron--rotated" : ""}`} size={14} />
      </button>

      {isOpen && (
        <div className="hfb-dropdown__menu">
          {typeof children === "function" ? children(() => setIsOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  const { listings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);

  // Read URL search params
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialCondition = searchParams.get("condition") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedConditions, setSelectedConditions] = useState(
    initialCondition ? [initialCondition] : []
  );
  const [maxPrice, setMaxPrice] = useState(200000);
  const [selectedCity, setSelectedCity] = useState("all");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyWithBill, setOnlyWithBill] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Keep searchParams synced if initial values change
  useEffect(() => {
    if (searchParams.get("q") !== null) {
      setSearchQuery(searchParams.get("q") || "");
    }
    if (searchParams.get("category")) {
      setSelectedCategory(searchParams.get("category"));
    }
  }, [searchParams]);

  // Toggle condition checkbox
  const toggleCondition = (condKey) => {
    setSelectedConditions((prev) =>
      prev.includes(condKey) ? prev.filter((c) => c !== condKey) : [...prev, condKey]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedConditions([]);
    setMaxPrice(200000);
    setSelectedCity("all");
    setOnlyVerified(false);
    setOnlyWithBill(false);
    setSortBy("newest");
    setSearchParams({});
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Keyword Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (item.title || "").toLowerCase().includes(q);
          const matchBrand = (item.brand || "").toLowerCase().includes(q);
          const matchModel = (item.model || "").toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchModel) return false;
        }

        // Category
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
          return false;
        }

        // Condition
        if (selectedConditions.length > 0 && !selectedConditions.includes(item.condition)) {
          return false;
        }

        // Max price
        if (item.price > maxPrice) {
          return false;
        }

        // City
        if (selectedCity !== "all" && !(item.city || "").toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }

        // Verified Sellers
        if (onlyVerified && !item.seller?.verified) {
          return false;
        }

        // Original Invoice
        if (onlyWithBill && !item.hasBill) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "impact") return (b.impactKg || 0) - (a.impactKg || 0);
        return 0; // Default newest
      });
  }, [listings, searchQuery, selectedCategory, selectedConditions, maxPrice, selectedCity, onlyVerified, onlyWithBill, sortBy]);

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    selectedConditions.length +
    (maxPrice < 200000 ? 1 : 0) +
    (selectedCity !== "all" ? 1 : 0) +
    (onlyVerified ? 1 : 0) +
    (onlyWithBill ? 1 : 0);

  // Labels for dropdown buttons
  const categoryLabel =
    selectedCategory === "all"
      ? "All Categories"
      : CATEGORIES.find((c) => c.id === selectedCategory)?.name || "Categories";

  const conditionLabel =
    selectedConditions.length === 0
      ? "Condition"
      : selectedConditions.length === 1
      ? CONDITION_GRADES[selectedConditions[0]]?.label || "Condition"
      : `${selectedConditions.length} Conditions`;

  const priceLabel =
    maxPrice < 200000 ? `Under ₹${(maxPrice / 1000).toFixed(0)}k` : "Price";

  const locationLabel =
    selectedCity === "all" ? "Location" : selectedCity;

  const cities = [
    { value: "all", label: "All India (Escrow Shipped)" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Delhi", label: "Delhi NCR / Gurgaon" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Pune", label: "Pune" },
    { value: "Chennai", label: "Chennai" },
  ];

  return (
    <div className="browse-page-root">

      {/* ==================================================================== */}
      {/* 1. HORIZONTAL FILTER BAR (Full-width white bar directly below navbar) */}
      {/* ==================================================================== */}
      <section className="hfb-bar" aria-label="Product Filters">
        <div className="hfb-container">

          {/* Left: Scrollable horizontal filter controls */}
          <div className="hfb-controls-scroll">

            {/* Mobile-only "Filters" Button for small screens */}
            <button
              type="button"
              className={`hfb-main-filter-btn hfb-main-filter-btn--mobile-only ${activeFilterCount > 0 ? "hfb-main-filter-btn--active" : ""}`}
              onClick={() => setMobileFilterOpen(true)}
              title="All filter options"
            >
              <SlidersHorizontal size={14} className="hfb-icon" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="hfb-filter-badge">{activeFilterCount}</span>
              )}
            </button>

            <div className="hfb-divider hfb-divider--mobile-only" />

            {/* 1. All Categories Dropdown */}
            <FilterDropdown
              label={categoryLabel}
              isActive={selectedCategory !== "all"}
            >
              {(close) => (
                <div className="hfb-menu-content hfb-menu-categories">
                  <div className="hfb-menu-header">Select Category</div>
                  <div className="hfb-options-list">
                    <button
                      type="button"
                      className={`hfb-option-item ${selectedCategory === "all" ? "hfb-option-item--selected" : ""}`}
                      onClick={() => {
                        setSelectedCategory("all");
                        close();
                      }}
                    >
                      <span className="hfb-option-name">All Categories</span>
                      {selectedCategory === "all" && <Check size={14} className="hfb-check" />}
                    </button>

                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`hfb-option-item ${selectedCategory === cat.id ? "hfb-option-item--selected" : ""}`}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          close();
                        }}
                      >
                        <span className="hfb-option-name">{cat.name}</span>
                        {selectedCategory === cat.id && <Check size={14} className="hfb-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </FilterDropdown>

            {/* 2. Condition Dropdown */}
            <FilterDropdown
              label={conditionLabel}
              count={selectedConditions.length > 1 ? selectedConditions.length : 0}
              isActive={selectedConditions.length > 0}
            >
              {() => (
                <div className="hfb-menu-content hfb-menu-conditions">
                  <div className="hfb-menu-header hfb-menu-header--with-link">
                    <span>Hardware Condition</span>
                    <button
                      type="button"
                      className="hfb-guide-text-btn"
                      onClick={() => setIsConditionModalOpen(true)}
                    >
                      Grading Guide
                    </button>
                  </div>
                  <div className="hfb-options-list">
                    {Object.entries(CONDITION_GRADES).map(([key, info]) => {
                      const isChecked = selectedConditions.includes(key);
                      return (
                        <label
                          key={key}
                          className={`hfb-checkbox-row ${isChecked ? "hfb-checkbox-row--checked" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCondition(key);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="hfb-checkbox-input"
                          />
                          <span className={`hfb-cond-dot hfb-cond-dot--${key.replaceAll("_", "-")}`} />
                          <span className="hfb-checkbox-label">{info.label}</span>
                          {key === "for_parts" && (
                            <span className="hfb-salvage-pill">Salvage</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {selectedConditions.length > 0 && (
                    <div className="hfb-menu-footer">
                      <button
                        type="button"
                        className="hfb-menu-clear-link"
                        onClick={() => setSelectedConditions([])}
                      >
                        Reset Condition
                      </button>
                    </div>
                  )}
                </div>
              )}
            </FilterDropdown>

            {/* 3. Price Dropdown */}
            <FilterDropdown
              label={priceLabel}
              isActive={maxPrice < 200000}
            >
              {() => (
                <div className="hfb-menu-content hfb-menu-price">
                  <div className="hfb-menu-header">Maximum Budget</div>
                  <div className="hfb-price-slider-wrap">
                    <div className="hfb-price-slider-info">
                      <span className="hfb-price-slider-tag">Up to</span>
                      <span className="hfb-price-slider-amount">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(maxPrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="200000"
                      step="2000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="hfb-range-input"
                    />
                    <div className="hfb-price-range-legend">
                      <span>₹1,000</span>
                      <span>₹2,00,000</span>
                    </div>
                  </div>
                  <div className="hfb-price-presets">
                    {[25000, 50000, 100000, 200000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`hfb-preset-pill ${maxPrice === preset ? "hfb-preset-pill--active" : ""}`}
                        onClick={() => setMaxPrice(preset)}
                      >
                        {preset === 200000 ? "Any Price" : `Under ₹${preset / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </FilterDropdown>

            {/* 4. Location Dropdown */}
            <FilterDropdown
              label={locationLabel}
              isActive={selectedCity !== "all"}
            >
              {(close) => (
                <div className="hfb-menu-content hfb-menu-location">
                  <div className="hfb-menu-header">Seller Location / Hub</div>
                  <div className="hfb-options-list">
                    {cities.map((city) => (
                      <button
                        key={city.value}
                        type="button"
                        className={`hfb-option-item ${selectedCity === city.value ? "hfb-option-item--selected" : ""}`}
                        onClick={() => {
                          setSelectedCity(city.value);
                          close();
                        }}
                      >
                        <span>{city.label}</span>
                        {selectedCity === city.value && <Check size={14} className="hfb-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </FilterDropdown>

            {/* 5. Verified Sellers Toggle Button */}
            <button
              type="button"
              className={`hfb-toggle-chip ${onlyVerified ? "hfb-toggle-chip--active" : ""}`}
              onClick={() => setOnlyVerified((prev) => !prev)}
            >
              <ShieldCheck size={14} className="hfb-toggle-icon" />
              <span>Verified Sellers</span>
            </button>

            {/* Invoice Toggle Button */}
            <button
              type="button"
              className={`hfb-toggle-chip ${onlyWithBill ? "hfb-toggle-chip--active" : ""}`}
              onClick={() => setOnlyWithBill((prev) => !prev)}
            >
              <FileText size={13} className="hfb-toggle-icon" />
              <span>With Bill/Invoice</span>
            </button>

            {/* Clear all (shown when filters are active) */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="hfb-clear-all-btn"
                onClick={resetFilters}
                title="Reset all active filters"
              >
                <RotateCcw size={12} />
                <span>Clear all</span>
              </button>
            )}

          </div>

          {/* Right: Sort By Control */}
          <div className="hfb-sort-wrap">
            <label htmlFor="hfb-sort-select" className="hfb-sort-label">
              Sort by:
            </label>
            <select
              id="hfb-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hfb-sort-select"
            >
              <option value="newest">Latest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="impact">Highest E-Waste Impact</option>
            </select>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. ACTIVE FILTERS & RESULTS INFORMATION                              */}
      {/* ==================================================================== */}
      <div className="browse-content-container">

        <div className="browse-results-bar">
          <div className="browse-results-info">
            <span className="browse-results-count">
              Showing <strong>{filteredListings.length}</strong> items
            </span>
            {searchQuery && (
              <span className="browse-search-query-tag">
                matching "<em>{searchQuery}</em>"
              </span>
            )}
            <span className="browse-escrow-badge">
              Escrow Protected &amp; Verified
            </span>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="browse-chips-row">
              <span className="browse-chips-label">Active:</span>

              {selectedCategory !== "all" && (
                <span className="browse-chip">
                  <span>Category: {CATEGORIES.find((c) => c.id === selectedCategory)?.name}</span>
                  <button type="button" onClick={() => setSelectedCategory("all")} aria-label="Remove category filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedConditions.map((cond) => (
                <span key={cond} className="browse-chip">
                  <span>{CONDITION_GRADES[cond]?.label}</span>
                  <button type="button" onClick={() => toggleCondition(cond)} aria-label={`Remove ${cond} filter`}>
                    <X size={12} />
                  </button>
                </span>
              ))}

              {maxPrice < 200000 && (
                <span className="browse-chip">
                  <span>Under ₹{maxPrice.toLocaleString("en-IN")}</span>
                  <button type="button" onClick={() => setMaxPrice(200000)} aria-label="Remove price filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedCity !== "all" && (
                <span className="browse-chip">
                  <span>City: {selectedCity}</span>
                  <button type="button" onClick={() => setSelectedCity("all")} aria-label="Remove city filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {onlyVerified && (
                <span className="browse-chip">
                  <span>Verified Sellers Only</span>
                  <button type="button" onClick={() => setOnlyVerified(false)} aria-label="Remove verified filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {onlyWithBill && (
                <span className="browse-chip">
                  <span>With Bill</span>
                  <button type="button" onClick={() => setOnlyWithBill(false)} aria-label="Remove bill filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                type="button"
                className="browse-chips-clear-all"
                onClick={resetFilters}
              >
                Clear all ({activeFilterCount})
              </button>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 3. PRODUCT LISTINGS GRID                                             */}
        {/* ==================================================================== */}
        <div className="browse-listings-wrapper">
          {filteredListings.length > 0 ? (
            <div className="browse-grid">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="browse-empty">
              <div className="browse-empty__icon">
                <Search size={28} />
              </div>
              <h3 className="browse-empty__title">No items match your filter criteria</h3>
              <p className="browse-empty__text">
                Try widening your price range, clearing selected condition grades, or switching to "All Categories".
              </p>
              <button
                type="button"
                className="browse-empty__reset-btn"
                onClick={resetFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ==================================================================== */}
      {/* MOBILE / TABLET FULL FILTERS DRAWER                                  */}
      {/* ==================================================================== */}
      {mobileFilterOpen && (
        <div className="hfb-drawer-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="hfb-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="hfb-drawer-header">
              <div className="hfb-drawer-title">
                <SlidersHorizontal size={18} />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </div>
              <button
                type="button"
                className="hfb-drawer-close"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="hfb-drawer-body">
              {/* Categories */}
              <div className="hfb-drawer-group">
                <label className="hfb-drawer-label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="hfb-drawer-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="hfb-drawer-group">
                <div className="hfb-drawer-label-row">
                  <label className="hfb-drawer-label">Condition Grade</label>
                  <button
                    type="button"
                    className="hfb-guide-text-btn"
                    onClick={() => {
                      setMobileFilterOpen(false);
                      setIsConditionModalOpen(true);
                    }}
                  >
                    Guide
                  </button>
                </div>
                <div className="hfb-drawer-checkboxes">
                  {Object.entries(CONDITION_GRADES).map(([key, info]) => {
                    const checked = selectedConditions.includes(key);
                    return (
                      <label
                        key={key}
                        className={`hfb-checkbox-row ${checked ? "hfb-checkbox-row--checked" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCondition(key);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="hfb-checkbox-input"
                        />
                        <span className={`hfb-cond-dot hfb-cond-dot--${key.replaceAll("_", "-")}`} />
                        <span className="hfb-checkbox-label">{info.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="hfb-drawer-group">
                <div className="hfb-drawer-label-row">
                  <label className="hfb-drawer-label">Max Budget</label>
                  <span className="hfb-price-slider-amount">
                    ₹{maxPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="200000"
                  step="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="hfb-range-input"
                />
              </div>

              {/* Location */}
              <div className="hfb-drawer-group">
                <label className="hfb-drawer-label">City / Metro</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="hfb-drawer-select"
                >
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified & Invoice toggles */}
              <div className="hfb-drawer-group">
                <label className="hfb-checkbox-row">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="hfb-checkbox-input"
                  />
                  <ShieldCheck size={16} className="hfb-toggle-icon" />
                  <span className="hfb-checkbox-label">Verified Sellers Only</span>
                </label>
                <label className="hfb-checkbox-row" style={{ marginTop: "8px" }}>
                  <input
                    type="checkbox"
                    checked={onlyWithBill}
                    onChange={(e) => setOnlyWithBill(e.target.checked)}
                    className="hfb-checkbox-input"
                  />
                  <FileText size={16} className="hfb-toggle-icon" />
                  <span className="hfb-checkbox-label">Original Invoice / Bill available</span>
                </label>
              </div>
            </div>

            <div className="hfb-drawer-footer">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="hfb-drawer-reset-btn"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                className="hfb-drawer-apply-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filteredListings.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Condition Grading Guide Modal */}
      <ConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
      />

    </div>
  );
}
