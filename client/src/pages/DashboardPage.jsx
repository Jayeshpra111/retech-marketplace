import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Heart,
  Leaf,
  ShieldCheck,
  Truck,
  PlusCircle,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import '../styles/pages.css';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  const { user, listings, wishlist, orders, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="dashboard-signin">
        <div className="dashboard-signin__icon">
          <User className="dashboard-icon dashboard-icon--large" />
        </div>
        <h2 className="dashboard-signin__title">Sign in to your Account</h2>
        <p className="dashboard-signin__summary">
          Access your active listings, track escrow orders, and view your personal circular e-waste diversion metrics.
        </p>
        <div className="dashboard-signin__actions">
          <Link
            to="/login"
            className="dashboard-button dashboard-button--primary"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="dashboard-button dashboard-button--secondary"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const myListings = listings.filter(l => (l.seller?.id || l.seller?._id) === user.id || l.seller?.name?.includes('Jayesh'));
  const wishlistedItems = listings.filter(l => wishlist.includes(l.id));

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="dashboard-page">

      {/* Profile Header */}
      <div className="dashboard-profile">
        <div className="dashboard-profile__identity">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user.name}
            className="dashboard-profile__avatar"
          />
          <div>
            <div className="dashboard-profile__heading">
              <h1 className="dashboard-profile__name">{user.name}</h1>
              {user.verified && (
                <span className="dashboard-profile__verified">
                  <ShieldCheck className="dashboard-icon dashboard-icon--tiny" /> Verified User
                </span>
              )}
            </div>
            <p className="dashboard-profile__location">
              Member since {user.memberSince || '2026'} • {user.city || 'Bangalore, KA'}
            </p>

            <div className="dashboard-profile__actions">
              <button
                onClick={handleLogout}
                className="dashboard-profile__action dashboard-profile__action--logout"
                title="Sign out of your session"
              >
                <LogOut className="dashboard-icon dashboard-icon--small" />
                <span>Sign Out</span>
              </button>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="dashboard-profile__action dashboard-profile__action--admin"
                >
                  <Shield className="dashboard-icon dashboard-icon--small" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Environmental Diverted Stat badge */}
        <div className="dashboard-impact">
          <div className="dashboard-impact__icon">
            <Leaf className="dashboard-icon dashboard-icon--medium" />
          </div>
          <div>
            <span className="dashboard-impact__value">
              {user.totalKgDiverted} kg E-Waste
            </span>
            <span className="dashboard-impact__description">
              Personal lifetime diversion ({user.totalCo2Saved} kg CO2 saved)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="dashboard-tabs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'listings', label: `My Listings (${myListings.length})` },
          { id: 'orders', label: `Orders & Tracking (${orders.length})` },
          { id: 'wishlist', label: `Wishlist (${wishlist.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchParams({ tab: tab.id });
            }}
            className={`dashboard-tabs__button ${activeTab === tab.id ? 'is-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="dashboard-tab-content">

          {/* Quick Metrics */}
          <div className="dashboard-metrics">
            <div className="dashboard-metric">
              <span className="dashboard-metric__label">Active Listings</span>
              <p className="dashboard-metric__value">{myListings.length}</p>
              <span className="dashboard-metric__note dashboard-metric__note--eco">100% moderation approved</span>
            </div>

            <div className="dashboard-metric">
              <span className="dashboard-metric__label">Total Inquiries</span>
              <p className="dashboard-metric__value">24</p>
              <span className="dashboard-metric__note">Average response &lt; 15 mins</span>
            </div>

            <div className="dashboard-metric">
              <span className="dashboard-metric__label">Purchases & Orders</span>
              <p className="dashboard-metric__value">{orders.length}</p>
              <span className="dashboard-metric__note dashboard-metric__note--blue">Protected in Escrow</span>
            </div>

            <div className="dashboard-metric">
              <span className="dashboard-metric__label">Total Diverted Impact</span>
              <p className="dashboard-metric__value dashboard-metric__value--eco">{user.totalKgDiverted} kg</p>
              <span className="dashboard-metric__note dashboard-metric__note--eco">~{user.totalCo2Saved} kg CO2 equivalent</span>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="dashboard-promo">
            <div>
              <h3 className="dashboard-promo__title">Have spare hardware or old phones gathering dust?</h3>
              <p className="dashboard-promo__summary">
                List them in under 3 minutes. Even broken devices with functioning motherboards or cameras sell fast under "For Parts".
              </p>
            </div>
            <Link
              to="/sell"
              className="dashboard-promo__button"
            >
              <PlusCircle className="dashboard-icon dashboard-icon--small" />
              <span>Post New Listing</span>
            </Link>
          </div>

        </div>
      )}

      {/* Tab 2: My Listings */}
      {activeTab === 'listings' && (
        <div className="dashboard-tab-content">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-header__title">Your Published Listings</h2>
            <Link
              to="/sell"
              className="dashboard-create-link"
            >
              <PlusCircle className="dashboard-icon dashboard-icon--small" />
              <span>Create Listing</span>
            </Link>
          </div>

          {myListings.length > 0 ? (
            <div className="dashboard-listing-grid">
              {myListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <Package className="dashboard-empty-state__icon" />
              <h3 className="dashboard-empty-state__title">No listings published yet</h3>
              <p className="dashboard-empty-state__message">
                You haven't listed any electronics or hardware yet. Turn your unused gear into cash.
              </p>
              <Link
                to="/sell"
                className="dashboard-button dashboard-button--primary"
              >
                List Your First Item
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Orders & Escrow Tracking */}
      {activeTab === 'orders' && (
        <div className="dashboard-tab-content">
          <h2 className="dashboard-section-header__title">Orders & Escrow Lifecycle</h2>

          {orders.map((order) => (
            <div key={order.id} className="dashboard-order">
              <div className="dashboard-order__header">
                <div>
                  <span className="dashboard-order__id">{order.id}</span>
                  <span className="dashboard-order__date">Placed on {order.date}</span>
                </div>
                <div className="dashboard-order__status-wrap">
                  <span className="dashboard-order__status">
                    <Truck className="dashboard-icon dashboard-icon--tiny" />
                    <span>Status: {order.status.toUpperCase()}</span>
                  </span>
                </div>
              </div>

              {/* Item snapshot */}
              <div className="dashboard-order__listing">
                <img
                  src={order.image}
                  alt={order.title}
                  className="dashboard-order__image"
                />
                <div className="dashboard-order__copy">
                  <h3 className="dashboard-order__title">{order.title}</h3>
                  <p className="dashboard-order__seller">Seller: {order.sellerName}</p>
                  <p className="dashboard-order__amount">{formatPrice(order.amount)}</p>
                </div>
              </div>

              {/* Escrow Status Banner */}
              <div className="dashboard-order__protection">
                <div className="dashboard-order__protection-copy">
                  <ShieldCheck className="dashboard-icon dashboard-icon--small dashboard-order__protection-icon" />
                  <span>{order.protectionStatus}</span>
                </div>
                <span className="dashboard-order__tracking">{order.trackingNumber}</span>
              </div>

              {/* Action buttons */}
              <div className="dashboard-order__actions">
                <button
                  onClick={() => alert("Dispute Support: A ReTech trust officer will review within 24 hours. Your escrow payment is frozen.")}
                  className="dashboard-order__button dashboard-order__button--secondary"
                >
                  Open Dispute / Issue
                </button>
                <button
                  onClick={() => alert("Delivery Confirmed! Escrow payout released to seller. Thank you for circular trade!")}
                  className="dashboard-order__button dashboard-order__button--primary"
                >
                  Confirm Delivery & Release Escrow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="dashboard-tab-content">
          <h2 className="dashboard-section-header__title">Your Saved Items ({wishlistedItems.length})</h2>

          {wishlistedItems.length > 0 ? (
            <div className="dashboard-listing-grid">
              {wishlistedItems.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <Heart className="dashboard-empty-state__icon" />
              <h3 className="dashboard-empty-state__title">Your wishlist is empty</h3>
              <p className="dashboard-empty-state__message">
                Click the heart icon on any product to save it here for quick comparison.
              </p>
              <Link
                to="/browse"
                className="dashboard-button dashboard-button--dark"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
