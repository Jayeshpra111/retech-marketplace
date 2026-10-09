import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Search,
  ShieldCheck,
  Leaf,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Smartphone,
  Laptop,
  Tablet,
  Camera,
  Gamepad2,
  MemoryStick,
  HardDrive,
  Zap,
  Info,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import ListingCard from '../components/ListingCard';
import ConditionModal from '../components/ConditionModal';
import '../styles/pages.css';

export default function HomePage() {
  const { listings, isListingsLoading, totalEwasteDiverted, totalCo2Saved, user } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="home-icon" />;
      case 'Laptop': return <Laptop className="home-icon" />;
      case 'Tablet': return <Tablet className="home-icon" />;
      case 'Camera': return <Camera className="home-icon" />;
      case 'Gamepad2': return <Gamepad2 className="home-icon" />;
      case 'Cpu': return <Cpu className="home-icon" />;
      case 'MemoryStick': return <MemoryStick className="home-icon" />;
      case 'HardDrive': return <HardDrive className="home-icon" />;
      case 'Layers': return <Layers className="home-icon" />;
      case 'Zap': return <Zap className="home-icon" />;
      default: return <Recycle className="home-icon" />;
    }
  };

  return (
    <div className="home-page">

      {/* 1. Next-Gen Tech Landing Hero (Image 1 Style) */}
      <section className="dark-landing-hero">
        <div className="dlh-glow-bg"></div>

        <div className="dlh-container">
          {/* Mission Badge */}
          <div className="dlh-badge">
            <Sparkles size={14} className="dlh-badge-icon" />
            <span>
              {user ? `Welcome back, ${user.name?.split(' ')[0] || 'Member'} • Verified Circular Hardware Hub` : 'Next-Gen Circular Tech & Hardware Marketplace'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="dlh-title">
            Keep Electronics in Circulation with{' '}
            <span className="dlh-title-accent">ReTech Market</span>
          </h1>

          {/* Subtitle */}
          <p className="dlh-subtitle">
            Production-ready circular marketplace engineered with automated escrow protection,
            certified component-level grading, and verified buyer-seller trust.
          </p>

          {/* CTA Action Buttons (Tailored for Logged-In User) */}
          <div className="dlh-actions">
            <button
              type="button"
              className="dlh-btn-primary"
              onClick={() => navigate('/browse')}
              id="hero-explore-btn"
            >
              <span>Explore Hardware</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="dlh-btn-secondary"
              onClick={() => navigate('/sell')}
              id="hero-sell-btn"
            >
              Sell an Item
            </button>
            <button
              type="button"
              className="dlh-btn-browse"
              onClick={() => navigate('/dashboard')}
              id="hero-dashboard-btn"
            >
              My Dashboard &amp; Orders
            </button>
          </div>

          {/* 3 Tech Feature Cards (Image 1 Layout) */}
          <div className="dlh-cards">
            {/* Card 1 */}
            <div className="dlh-card">
              <div className="dlh-card-icon dlh-card-icon--blue">
                <Cpu size={20} />
              </div>
              <h3 className="dlh-card-title">Verified Hardware Architecture</h3>
              <p className="dlh-card-desc">
                Component-level diagnostics for GPUs, CPUs, motherboards, RAM, and MacBooks with verified condition grades.
              </p>
            </div>

            {/* Card 2 */}
            <div className="dlh-card">
              <div className="dlh-card-icon dlh-card-icon--green">
                <ShieldCheck size={20} />
              </div>
              <h3 className="dlh-card-title">100% Escrow Protection</h3>
              <p className="dlh-card-desc">
                Buyer funds remain safely secured in automated escrow until your hardware arrives, is benchmarked, and approved.
              </p>
            </div>

            {/* Card 3 */}
            <div className="dlh-card">
              <div className="dlh-card-icon dlh-card-icon--purple">
                <Leaf size={20} />
              </div>
              <h3 className="dlh-card-title">LCA E-Waste &amp; Carbon Tracking</h3>
              <p className="dlh-card-desc">
                Every trade quantifies kilograms of diverted e-waste from landfills and embodied CO₂ emissions spared.
              </p>
            </div>
          </div>

          {/* Fast Search Box */}
          <form onSubmit={handleHeroSearch} className="dlh-search-form">
            <div className="dlh-search-box">
              <Search size={18} className="dlh-search-icon" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search MacBook M1, RTX 3080, DDR5 RAM, salvage hardware..."
                className="dlh-search-input"
              />
              <button type="submit" className="dlh-search-btn">
                <span>Search</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="dlh-popular-pills">
              <span className="dlh-popular-label">Popular:</span>
              <button type="button" onClick={() => navigate('/browse?q=MacBook')} className="dlh-pill">MacBook M1</button>
              <button type="button" onClick={() => navigate('/browse?q=iPhone')} className="dlh-pill">iPhone 14</button>
              <button type="button" onClick={() => navigate('/browse?q=iPad')} className="dlh-pill">iPad Pro</button>
              <button type="button" onClick={() => navigate('/browse?q=Sony')} className="dlh-pill">Sony Headphones</button>
            </div>
          </form>

        </div>
      </section>

      {/* 2. Platform Impact Metric Counter (Critical PRD feature) */}
      <section className="home-impact-section">
        <div className="home-impact-panel">
          <div className="home-impact-panel__main">

            <div className="home-impact-panel__intro">
              <div className="home-impact-panel__eyebrow">
                <Leaf className="home-icon home-icon--badge home-icon--eco" />
                <span>Live Environmental Diverted Counter</span>
              </div>
              <h2 className="home-impact-panel__title">
                Every transaction spares our planet from e-waste.
              </h2>
              <p className="home-impact-panel__summary">
                Estimated metrics calculated using UNEP e-waste lifecycle weights.
              </p>
            </div>

            {/* Stat Counters */}
            <div className="home-impact-stats">

              <div className="home-impact-stat home-impact-stat--eco">
                <span className="home-impact-stat__value">
                  {totalEwasteDiverted.toLocaleString()} kg
                </span>
                <span className="home-impact-stat__label">
                  E-Waste Diverted from Landfills*
                </span>
                <span className="home-impact-stat__note">(estimated)</span>
              </div>

              <div className="home-impact-stat home-impact-stat--blue">
                <span className="home-impact-stat__value">
                  {totalCo2Saved.toLocaleString()} kg
                </span>
                <span className="home-impact-stat__label">
                  CO2 Emissions Saved vs New*
                </span>
                <span className="home-impact-stat__note">(embodied carbon)</span>
              </div>

              <div className="home-impact-stat home-impact-stat--purple">
                <span className="home-impact-stat__value">
                  3,142
                </span>
                <span className="home-impact-stat__label">
                  Devices & Parts Reused
                </span>
                <span className="home-impact-stat__note">(circular lifecycle)</span>
              </div>

            </div>

          </div>

          <div className="home-impact-panel__footer">
            <span className="home-impact-panel__footnote">
              <Info className="home-icon home-icon--tiny" />
              *All figures derived from category weight tables.
            </span>
            <Link to="/impact" className="home-impact-panel__methodology">
              <span>Read Impact Methodology & Sources</span>
              <ArrowRight className="home-icon home-icon--tiny" />
            </Link>
          </div>
        </div>

        
      </section>

      {/* 3. Shop by Category Grid (with Component Marketplace & For Parts) */}
      <section className="home-section">
        <div className="home-section__header home-section__header--bottom">
          <div>
            <h2 className="home-section__title">Explore by Category</h2>
            <p className="home-section__summary">
              Verified pre-owned smartphones, laptops, audio, tablets, and gaming consoles
            </p>
          </div>
          <Link
            to="/browse"
            className="home-section__link"
          >
            <span>View All Listings</span>
            <ArrowRight className="home-icon home-icon--small" />
          </Link>
        </div>

        {/* Category cards grid */}
        <div className="home-category-grid">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
            <Link
              key={cat.id}
              to={`/browse?category=${cat.id}`}
              className={`home-category-card ${cat.isComponent ? 'is-component' : ''}`}
            >
              <div className="home-category-card__icon">
                {getCategoryIcon(cat.icon)}
              </div>
              <h3 className="home-category-card__name">
                {cat.name}
              </h3>
              <span className="home-category-card__count">
                {cat.count} listings
              </span>
              {cat.isComponent && (
                <span className="home-category-card__tag">
                  Hardware
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* 4. "Sell for Parts" & Circular Salvage Spotlight (FR-13 & PRD requirement) */}
      <section className="home-section">
        <div className="home-salvage-banner">
          <div className="home-salvage-banner__content">
            <span className="home-salvage-banner__badge">
              <Wrench className="home-icon home-icon--badge" />
              Circular Salvage Program
            </span>
            <h2 className="home-salvage-banner__title">
              Got a broken phone or dead laptop? <br />
              Don't bin it. Sell it <span className="home-salvage-banner__title-accent">"For Parts"</span>.
            </h2>
            <p className="home-salvage-banner__summary">
              Repair shops, hobbyists, and tinkerers pay cash for cracked tablets, liquid-damaged laptops, and dead motherboards with salvageable chips, cameras, screens, and enclosures.
            </p>
            <div className="home-salvage-banner__actions">
              <Link
                to="/sell?forParts=true"
                className="home-salvage-banner__button home-salvage-banner__button--primary"
              >
                List a Broken Device
              </Link>
              <Link
                to="/browse?condition=for_parts"
                className="home-salvage-banner__button home-salvage-banner__button--secondary"
              >
                Browse Salvage Hardware
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Featured Listings Grid */}
      <section className="home-section">
        <div className="home-section__header">
          <div>
            <h2 className="home-section__title">Latest Verified Listings</h2>
            <p className="home-section__summary">
              Hand-checked devices, component stress-tested hardware, and salvage deals
            </p>
          </div>
          <button
            onClick={() => setIsConditionModalOpen(true)}
            className="home-condition-guide"
          >
            <Info className="home-icon home-icon--badge home-icon--eco" />
            <span>Condition Grading Guide</span>
          </button>
        </div>

        <div className="home-listing-grid">
          {isListingsLoading && listings.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  height: '340px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))
          ) : (
            listings.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id || listing._id} listing={listing} />
            ))
          )}
        </div>

        <div className="home-listing-more">
          <Link
            to="/browse"
            className="home-listing-more__button"
          >
            <span>Explore All {listings.length} Listings</span>
            <ArrowRight className="home-icon home-icon--small" />
          </Link>
        </div>
      </section>

      {/* 6. How It Works (3 Steps: List -> Chat -> Sell - design.md section 7) */}
      <section className="home-section">
        <div className="home-workflow-header">
          <span className="home-workflow-header__badge">
            Simple & Transparent Process
          </span>
          <h2 className="home-section__title">
            How ReTech Works in 3 Easy Steps
          </h2>
          <p className="home-section__summary">
            Whether you are selling a high-end gaming PC or broken electronics for parts, our circular workflow protects both parties.
          </p>
        </div>

        <div className="home-workflow-grid">

          {/* Step 1 */}
          <div className="home-workflow-card">
            <span className="home-workflow-card__number">01</span>
            <div className="home-workflow-card__copy">
              <h3 className="home-workflow-card__title">1. List in Under 3 Minutes</h3>
              <p className="home-workflow-card__summary">
                Snap photos, choose your standardized condition grade, and complete our interactive data-wipe checklist. Our system automatically computes your e-waste & CO2 savings.
              </p>
            </div>
            <div className="home-workflow-card__footer home-workflow-card__footer--eco">
              <CheckCircle2 className="home-icon home-icon--small" />
              <span>Instant AI specs & weight estimate</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="home-workflow-card">
            <span className="home-workflow-card__number">02</span>
            <div className="home-workflow-card__copy">
              <h3 className="home-workflow-card__title">2. Chat & Safe Offers</h3>
              <p className="home-workflow-card__summary">
                Negotiate prices securely via real-time in-app chat. Buyers make formal binding offers, keeping sensitive phone numbers and full addresses hidden until payment is committed.
              </p>
            </div>
            <div className="home-workflow-card__footer home-workflow-card__footer--blue">
              <ShieldCheck className="home-icon home-icon--small" />
              <span>Anti-scam & anti-phishing protection</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="home-workflow-card">
            <span className="home-workflow-card__number">03</span>
            <div className="home-workflow-card__copy">
              <h3 className="home-workflow-card__title">3. Ship & Escrow Payout</h3>
              <p className="home-workflow-card__summary">
                The buyer deposits money into secure escrow. Pack and dispatch the device with tracking. Once the buyer tests functionality and confirms delivery, payment is released.
              </p>
            </div>
            <div className="home-workflow-card__footer home-workflow-card__footer--purple">
              <TrendingUp className="home-icon home-icon--small" />
              <span>Guaranteed seller payouts</span>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Why ReTech Market? (Trust & Escrow Pillars) */}
      <section className="home-section">
        <div className="home-trust-panel">
          <div className="home-trust-panel__header">
            <h2 className="home-section__title">
              Engineered for Trust & Zero-Scam Electronics
            </h2>
            <p className="home-section__summary">
              Unlike general classifieds, ReTech provides structural safeguards built specifically for technology and computer hardware.
            </p>
          </div>

          <div className="home-trust-grid">

            <div className="home-trust-card">
              <div className="home-trust-card__icon home-trust-card__icon--blue">
                <ShieldCheck className="home-icon home-icon--medium" />
              </div>
              <h3 className="home-trust-card__title">Escrow-Held Payments</h3>
              <p className="home-trust-card__summary">
                Funds are held in secure escrow. Sellers only get paid after you receive the item, power it on, and confirm functionality.
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-card__icon home-trust-card__icon--eco">
                <CheckCircle2 className="home-icon home-icon--medium" />
              </div>
              <h3 className="home-trust-card__title">Mandatory Data Wipe</h3>
              <p className="home-trust-card__summary">
                Sellers must complete cryptographic wipe verification, unlink Apple/Google IDs, and remove SIM/SD cards before publishing.
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-card__icon home-trust-card__icon--purple">
                <Cpu className="home-icon home-icon--medium" />
              </div>
              <h3 className="home-trust-card__title">Hardware Compatibility</h3>
              <p className="home-trust-card__summary">
                Component listings enforce strict DDR, PCIe, socket, form factor, and wattage specs to prevent incompatible purchases.
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-card__icon home-trust-card__icon--green">
                <Recycle className="home-icon home-icon--medium" />
              </div>
              <h3 className="home-trust-card__title">Certified Recycler Hubs</h3>
              <p className="home-trust-card__summary">
                If an item is completely hazardous or cannot be salvaged, locate verified e-waste disposal centers in your city.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Condition Modal */}
      <ConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
      />

    </div>
  );
}
