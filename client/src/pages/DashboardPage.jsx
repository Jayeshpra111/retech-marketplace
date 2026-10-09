import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  X,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  ChevronRight,
  Recycle,
  Footprints,
  Trash2,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ListingCard from '../components/ListingCard';
import EditListingModal from '../components/EditListingModal';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import '../styles/pages.css';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  const { user, isAuthLoading, listings, wishlist, logout } = useApp();

  const [myOrders, setMyOrders] = useState([]);
  const [sellingOrders, setSellingOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Edit Listing state
  const [editingListing, setEditingListing] = useState(null);

  // Dispute modal state
  const [disputeModalOrder, setDisputeModalOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Item defective or not functioning as described');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Pay Now modal state for pending orders
  const [payingOrder, setPayingOrder] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load real user orders and listings from API
  useEffect(() => {
    if (user) {
      Promise.allSettled([
        api.orders.getMyOrders({ limit: 50 }),
        api.orders.getSellingOrders({ limit: 50 }),
        api.listings.getMyListings({ limit: 50 }),
      ]).then(([myRes, sellRes, listRes]) => {
        if (myRes.status === 'fulfilled' && myRes.value?.data) {
          setMyOrders(myRes.value.data);
        }
        if (sellRes.status === 'fulfilled' && sellRes.value?.data) {
          setSellingOrders(sellRes.value.data);
        }
        if (listRes.status === 'fulfilled' && listRes.value?.data) {
          setMyListings(listRes.value.data);
        } else {
          // Fallback to listings filtered by user id
          const uid = user.id || user._id;
          setMyListings(listings.filter((l) => (l.seller?.id || l.seller?._id) === uid));
        }
        setIsLoadingOrders(false);
      });
    }
  }, [user, listings]);

  if (isAuthLoading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

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
          <Link to="/login" className="dashboard-button dashboard-button--primary">
            Sign In
          </Link>
          <Link to="/register" className="dashboard-button dashboard-button--secondary">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const wishlistedItems = listings.filter((l) => wishlist.includes(l.id || l._id));

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Confirm delivery action
  const handleConfirmDelivery = async (orderId) => {
    try {
      await api.orders.confirmDelivery(orderId);
      setMyOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'delivered', paymentStatus: 'released' } : o))
      );
      toast.success('Delivery confirmed! Escrow funds have been successfully released to the seller.');
    } catch (err) {
      toast.error(err.message || 'Could not confirm delivery.');
    }
  };

  // Discard / cancel order action
  const handleDiscardOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to discard this order? The order will be cancelled and the item will be available for others on the marketplace.')) {
      return;
    }
    try {
      try {
        await api.orders.delete(orderId);
      } catch {
        await api.orders.cancel(orderId);
      }
      setMyOrders((prev) => prev.filter((o) => (o._id || o.id) !== orderId));
      toast.success('Order discarded and cancelled successfully.');
    } catch (err) {
      toast.error(err.message || 'Could not discard order.');
    }
  };

  // Submit real escrow dispute
  const handleOpenDispute = async (e) => {
    e.preventDefault();
    if (!disputeModalOrder) return;
    setIsSubmittingDispute(true);

    try {
      await api.disputes.create({
        orderId: disputeModalOrder._id,
        reason: disputeReason,
        description: disputeDescription,
      });

      setMyOrders((prev) =>
        prev.map((o) => (o._id === disputeModalOrder._id ? { ...o, orderStatus: 'disputed' } : o))
      );

      toast.success('Dispute filed successfully. Escrow funds frozen pending resolution.');
      setDisputeModalOrder(null);
      setDisputeDescription('');
    } catch (err) {
      toast.error(err.message || 'Failed to file dispute.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  // Edit & Delete listing handlers
  const handleEditListing = (listing) => {
    setEditingListing(listing);
  };

  const handleListingUpdated = (updatedListing) => {
    const updatedId = updatedListing._id || updatedListing.id;
    setMyListings((prev) =>
      prev.map((l) => ((l._id || l.id) === updatedId ? { ...l, ...updatedListing } : l))
    );
  };

  const handleDeleteListing = async (listing) => {
    const listingId = listing._id || listing.id;
    if (!window.confirm(`Are you sure you want to delete "${listing.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.listings.delete(listingId);
      setMyListings((prev) => prev.filter((l) => (l._id || l.id) !== listingId));
      toast.success('Listing deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.');
    }
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
          <div className="dashboard-profile__details">
            <div className="dashboard-profile__heading">
              <h1 className="dashboard-profile__name">{user.name}</h1>
              {user.verified !== false && (
                <span className="dashboard-profile__verified">
                  <ShieldCheck size={14} /> Verified User
                </span>
              )}
            </div>
            <div className="dashboard-profile__meta-row">
              <span className="dashboard-profile__meta-item">
                <Calendar size={14} /> Member since {user.memberSince || 'October 2026'}
              </span>
              <span className="dashboard-profile__meta-item">
                <MapPin size={14} /> {user.city || 'Bangalore, KA'}
              </span>
            </div>

            <div className="dashboard-profile__actions">
              <button
                onClick={handleLogout}
                className="dashboard-profile__action dashboard-profile__action--logout"
                title="Sign out of your session"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>

              {user.role === 'admin' && (
                <Link to="/admin" className="dashboard-profile__action dashboard-profile__action--admin">
                  <Shield size={14} />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Impact Widget (Right Side) */}
        <div className="dashboard-impact-card">
          <div className="dashboard-impact-list">
            <div className="dashboard-impact-row">
              <div className="dashboard-impact-row__icon-wrap">
                <Leaf size={18} />
              </div>
              <div className="dashboard-impact-row__content">
                <span className="dashboard-impact-row__label">E-Waste Diverted</span>
                <span className="dashboard-impact-row__value">{user.totalKgDiverted || 0}kg</span>
                <span className="dashboard-impact-row__sub">Kept from landfills</span>
              </div>
            </div>

            <div className="dashboard-impact-row">
              <div className="dashboard-impact-row__icon-wrap">
                <Recycle size={18} />
              </div>
              <div className="dashboard-impact-row__content">
                <span className="dashboard-impact-row__label">CO2 Equivalent Saved</span>
                <span className="dashboard-impact-row__value">{user.totalCo2Saved || 0}kg</span>
                <span className="dashboard-impact-row__sub">Calculated lifecycle footprint</span>
              </div>
            </div>

            <div className="dashboard-impact-row">
              <div className="dashboard-impact-row__icon-wrap">
                <Footprints size={18} />
              </div>
              <div className="dashboard-impact-row__content">
                <span className="dashboard-impact-row__sub">Calculated lifecycle footprint</span>
              </div>
            </div>
          </div>

          {/* Decorative globe & leaves illustration matching image */}
          <svg className="dashboard-impact-illustration" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="105" cy="80" r="48" fill="#ecfdf5" />
            <circle cx="105" cy="80" r="38" fill="#d1fae5" />
            <path d="M85 70C90 62 102 65 106 72C110 78 120 74 125 80C130 86 120 102 114 106C108 110 94 106 88 98C82 90 80 78 85 70Z" fill="#a7f3d0" />
            <path d="M120 58C124 54 130 58 132 64C128 68 122 66 120 58Z" fill="#6ee7b7" />
            <path d="M142 66C138 58 128 60 130 70C132 80 146 74 142 66Z" fill="#34d399" opacity="0.9" />
            <path d="M150 92C142 86 134 94 140 102C146 110 156 96 150 92Z" fill="#10b981" opacity="0.8" />
            <path d="M136 116C128 114 126 122 132 126C138 130 144 118 136 116Z" fill="#059669" opacity="0.75" />
          </svg>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: Leaf },
          { id: 'listings', label: `My Listings (${myListings.length})`, icon: Package },
          { id: 'orders', label: `Orders (${myOrders.length})`, icon: Truck },
          { id: 'wishlist', label: `Wishlist (${wishlistedItems.length})`, icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`dashboard-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="dashboard-tab-content">
          <div className="dashboard-promo">
            <div className="dashboard-promo__left">
              <div className="dashboard-promo__icon-wrap">
                <Recycle size={24} color="#a7f3d0" />
              </div>
              <div className="dashboard-promo__copy">
                <h3 className="dashboard-promo__title">Have older gadgets or parts gathering dust?</h3>
                <p className="dashboard-promo__text">
                  List them in under 3 minutes. Even broken devices with functioning motherboards or cameras sell fast
                  under "For Parts".
                </p>
              </div>
            </div>
            <Link to="/sell" className="dashboard-promo__button">
              <PlusCircle size={16} />
              <span>Post New Listing</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: My Listings */}
      {activeTab === 'listings' && (
        <div className="dashboard-tab-content">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-header__title">Your Published Listings</h2>
            <Link to="/sell" className="dashboard-create-link">
              <PlusCircle className="dashboard-icon dashboard-icon--small" />
              <span>Create Listing</span>
            </Link>
          </div>

          {myListings.length > 0 ? (
            <div className="dashboard-listing-grid">
              {myListings.map((listing) => (
                <ListingCard
                  key={listing.id || listing._id}
                  listing={listing}
                  onEdit={handleEditListing}
                  onDelete={handleDeleteListing}
                />
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <Package className="dashboard-empty-state__icon" />
              <h3 className="dashboard-empty-state__title">No listings published yet</h3>
              <p className="dashboard-empty-state__message">
                You haven't listed any electronics or hardware yet. Turn your unused gear into cash.
              </p>
              <Link to="/sell" className="dashboard-button dashboard-button--primary">
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

          {myOrders.length === 0 && !isLoadingOrders ? (
            <div className="dashboard-empty-state">
              <Truck className="dashboard-empty-state__icon" />
              <h3 className="dashboard-empty-state__title">No active orders</h3>
              <p className="dashboard-empty-state__message">
                When you purchase electronics with 100% Escrow Protection, you can track delivery and release funds
                here.
              </p>
              <Link to="/browse" className="dashboard-button dashboard-button--primary">
                Explore Marketplace
              </Link>
            </div>
          ) : (
            myOrders.map((order) => {
              const itemTitle = order.listing?.title || order.title || 'Electronic Device';
              const itemImage =
                order.listing?.images?.[0]?.url ||
                (typeof order.listing?.images?.[0] === 'string' ? order.listing.images[0] : null) ||
                order.image ||
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300';
              const sellerName = order.seller?.name || order.sellerName || 'Seller';
              const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date;
              const isDeliveredOrShipped = ['shipped', 'delivered'].includes(order.orderStatus);

              return (
                <div key={order._id || order.id} className="dashboard-order">
                  <div className="dashboard-order__header">
                    <div>
                      <span className="dashboard-order__id">Order #{order._id?.slice(-8) || order.id}</span>
                      <span className="dashboard-order__date">Placed on {orderDate}</span>
                    </div>
                    <div className="dashboard-order__status-wrap">
                      <span className="dashboard-order__status">
                        <Truck className="dashboard-icon dashboard-icon--tiny" />
                        <span>Status: {(order.orderStatus || order.status || 'pending').toUpperCase()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-order__listing">
                    <img src={itemImage} alt={itemTitle} className="dashboard-order__image" />
                    <div className="dashboard-order__copy">
                      <h3 className="dashboard-order__title">{itemTitle}</h3>
                      <p className="dashboard-order__seller">Seller: {sellerName}</p>
                      <p className="dashboard-order__amount">{formatPrice(order.priceAtPurchase || order.amount)}</p>
                    </div>
                  </div>

                  <div className="dashboard-order__protection">
                    <div className="dashboard-order__protection-copy">
                      <ShieldCheck className="dashboard-icon dashboard-icon--small dashboard-order__protection-icon" />
                      <span>
                        Payment Status: {(order.paymentStatus || 'unpaid').toUpperCase()} • Escrow Held by Platform
                      </span>
                    </div>
                    <span className="dashboard-order__tracking">
                      {order.trackingInfo?.trackingNumber || order.trackingNumber || 'Escrow Verified'}
                    </span>
                  </div>

                  <div className="dashboard-order__actions">
                    {/* Discard Order button for pending, unpaid or cancelled orders */}
                    {(order.orderStatus === 'pending' || order.orderStatus === 'cancelled' || order.paymentStatus === 'unpaid') && (
                      <button
                        onClick={() => handleDiscardOrder(order._id || order.id)}
                        className="dashboard-order__button dashboard-order__button--discard"
                        title="Cancel and discard this order"
                      >
                        <Trash2 size={14} style={{ marginRight: '6px' }} />
                        Discard Order
                      </button>
                    )}

                    {/* Pay Now button for pending unpaid orders */}
                    {order.paymentStatus === 'unpaid' && order.orderStatus === 'pending' && (
                      <button
                        onClick={() => setPayingOrder(order)}
                        className="dashboard-order__button dashboard-order__button--pay"
                        title="Pay via Online Escrow or switch to Cash"
                      >
                        <CreditCard size={14} style={{ marginRight: '6px' }} />
                        Pay Online / Choose Method
                      </button>
                    )}

                    {order.orderStatus !== 'disputed' && order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => setDisputeModalOrder(order)}
                        className="dashboard-order__button dashboard-order__button--secondary"
                      >
                        <AlertTriangle size={14} style={{ marginRight: '6px' }} />
                        Open Escrow Dispute
                      </button>
                    )}

                    {isDeliveredOrShipped && (
                      <button
                        onClick={() => handleConfirmDelivery(order._id)}
                        className="dashboard-order__button dashboard-order__button--primary"
                      >
                        <CheckCircle size={14} style={{ marginRight: '6px' }} />
                        Confirm Delivery & Release Escrow
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="dashboard-tab-content">
          <h2 className="dashboard-section-header__title">Your Saved Items ({wishlistedItems.length})</h2>

          {wishlistedItems.length > 0 ? (
            <div className="dashboard-listing-grid">
              {wishlistedItems.map((listing) => (
                <ListingCard key={listing.id || listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <Heart className="dashboard-empty-state__icon" />
              <h3 className="dashboard-empty-state__title">Your wishlist is empty</h3>
              <p className="dashboard-empty-state__message">
                Click the heart icon on any product to save it here for quick comparison.
              </p>
              <Link to="/browse" className="dashboard-button dashboard-button--dark">
                Browse Catalog
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Open Escrow Dispute
              </h3>
              <button
                onClick={() => setDisputeModalOrder(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              Filing a dispute freezes the escrow payout immediately. A platform trust officer will review the tracking and condition proof.
            </p>

            <form onSubmit={handleOpenDispute}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                  Dispute Reason
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#0F172A', color: '#fff', border: '1px solid #334155' }}
                >
                  <option value="Item defective or not functioning as described">Item defective or not functioning</option>
                  <option value="Item was not received / package empty">Item was not received / package empty</option>
                  <option value="Wrong model or counterfeit item received">Wrong model or counterfeit item</option>
                  <option value="Severe transit damage not disclosed">Severe damage not disclosed in listing</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                  Detailed Explanation
                </label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows="3"
                  placeholder="Describe the defect, missing parts, or issue observed..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#0F172A', color: '#fff', border: '1px solid #334155' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setDisputeModalOrder(null)}
                  style={{ padding: '10px 18px', borderRadius: '8px', background: 'transparent', color: '#94A3B8', border: '1px solid #334155', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: '#EF4444', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSubmittingDispute ? 'Submitting Dispute...' : 'Freeze Escrow & Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      <EditListingModal
        isOpen={Boolean(editingListing)}
        listing={editingListing}
        onClose={() => setEditingListing(null)}
        onUpdated={handleListingUpdated}
      />

      {/* Payment Gateway Modal for Pending Unpaid Orders */}
      {payingOrder && (
        <PaymentGatewayModal
          isOpen={Boolean(payingOrder)}
          order={payingOrder}
          itemTitle={payingOrder.listing?.title || payingOrder.title}
          amount={payingOrder.priceAtPurchase || payingOrder.amount}
          sellerName={payingOrder.seller?.name || payingOrder.sellerName}
          onClose={() => setPayingOrder(null)}
          onSuccess={(updatedOrder) => {
            setMyOrders((prev) =>
              prev.map((o) =>
                (o._id || o.id) === (updatedOrder._id || updatedOrder.id)
                  ? { ...o, ...updatedOrder }
                  : o
              )
            );
          }}
          onDiscard={(discardedId) => {
            setMyOrders((prev) => prev.filter((o) => (o._id || o.id) !== discardedId));
          }}
        />
      )}
    </div>
  );
}
