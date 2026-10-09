import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  Leaf, 
  MessageSquare, 
  Share2, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import '../styles/pages.css';

export default function SellerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setActiveChatListing } = useApp();

  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.auth
      .getUserProfile(id)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data;
        if (data) {
          setSeller(data.user);
          setListings(data.listings || []);
        } else {
          setError('Seller profile not found.');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load seller profile.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${seller?.name} on ReTech Market`,
        text: `Check out electronics listings from ${seller?.name} on ReTech Market.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const handleContactSeller = () => {
    if (!currentUser) {
      navigate(`/login?next=/seller/${id}`);
      return;
    }
    if (listings.length > 0) {
      setActiveChatListing(listings[0]);
    } else {
      toast('No active listings to message about yet.', { icon: 'ℹ️' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent Member';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="seller-profile-loading-state">
        <div className="spinner-lg" />
        <p>Loading seller profile & inventory...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="seller-profile-error-container">
        <AlertTriangle size={48} className="text-amber-500" />
        <h2>Seller Not Found</h2>
        <p>{error || 'The seller you are looking for does not exist or has closed their account.'}</p>
        <Link to="/browse" className="btn-primary-return">
          Browse All Marketplace Items
        </Link>
      </div>
    );
  }

  const avatarUrl =
    seller.avatar?.url ||
    (typeof seller.avatar === 'string' ? seller.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');

  return (
    <div className="seller-profile-page">
      <div className="seller-profile-header-banner">
        <div className="seller-profile-container">
          <Link to="/browse" className="back-nav-link">
            <ArrowLeft size={16} /> Back to Browse
          </Link>

          {/* Profile Card Hero */}
          <div className="seller-hero-card">
            <div className="seller-hero-main">
              <div className="seller-avatar-large-wrap">
                <img src={avatarUrl} alt={seller.name} className="seller-avatar-large" />
                {seller.isEmailVerified && (
                  <span className="seller-verified-shield" title="Verified Identity">
                    <ShieldCheck size={18} />
                  </span>
                )}
              </div>

              <div className="seller-hero-info">
                <div className="seller-title-row">
                  <h1>{seller.name}</h1>
                  <span className="badge-member-tier">Verified Community Seller</span>
                </div>

                <div className="seller-meta-row">
                  {seller.address?.city && (
                    <span className="seller-meta-item">
                      <MapPin size={15} />
                      {seller.address.city}{seller.address.state ? `, ${seller.address.state}` : ''}
                    </span>
                  )}
                  <span className="seller-meta-item">
                    <Calendar size={15} />
                    Member since {formatDate(seller.createdAt)}
                  </span>
                  <span className="seller-meta-item seller-rating-pill">
                    <Star size={14} className="star-icon-filled" />
                    <strong>{seller.ratingAvg ? seller.ratingAvg.toFixed(1) : '5.0'}</strong>
                    <span className="text-muted">({seller.ratingCount || 0} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="seller-hero-actions">
              <button onClick={handleShare} className="btn-seller-action btn-share" title="Share Profile">
                <Share2 size={18} />
                <span>Share</span>
              </button>
              <button onClick={handleContactSeller} className="btn-seller-action btn-message-seller">
                <MessageSquare size={18} />
                <span>Message Seller</span>
              </button>
            </div>
          </div>

          {/* Impact & Trust Highlights */}
          <div className="seller-stats-strip">
            <div className="seller-stat-box">
              <div className="stat-icon-wrap stat-icon-green">
                <Leaf size={20} />
              </div>
              <div className="stat-text">
                <span className="stat-number">{seller.totalKgDiverted || (listings.length * 2.4).toFixed(1)} kg</span>
                <span className="stat-label">E-Waste Diverted from Landfills</span>
              </div>
            </div>

            <div className="seller-stat-box">
              <div className="stat-icon-wrap stat-icon-blue">
                <Package size={20} />
              </div>
              <div className="stat-text">
                <span className="stat-number">{listings.length}</span>
                <span className="stat-label">Active Circular Listings</span>
              </div>
            </div>

            <div className="seller-stat-box">
              <div className="stat-icon-wrap stat-icon-purple">
                <ShieldCheck size={20} />
              </div>
              <div className="stat-text">
                <span className="stat-number">100%</span>
                <span className="stat-label">Escrow Buyer Protection Covered</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Seller Listings Grid */}
      <div className="seller-profile-container seller-listings-section">
        <div className="seller-listings-header">
          <div>
            <h2>Active Listings ({listings.length})</h2>
            <p className="section-subtext">All hardware covered by ReTech escrow and 48-hour inspection warranty.</p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="seller-no-listings">
            <Package size={48} className="muted-icon" />
            <h3>No items currently listed</h3>
            <p>This seller currently has no active listings available for purchase.</p>
            <Link to="/browse" className="btn-browse-other">
              Explore other verified sellers
            </Link>
          </div>
        ) : (
          <div className="seller-listings-grid">
            {listings.map((item) => {
              const imgUrl =
                item.images?.[0]?.url ||
                (typeof item.images?.[0] === 'string'
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600');

              return (
                <div key={item._id} className="seller-item-card">
                  <Link to={`/listings/${item._id}`} className="seller-item-thumb-link">
                    <img src={imgUrl} alt={item.title} className="seller-item-thumb" />
                    <span className="seller-item-condition-badge">
                      {item.condition ? item.condition.replace(/_/g, ' ') : 'Pre-owned'}
                    </span>
                  </Link>

                  <div className="seller-item-content">
                    {item.category?.name && (
                      <span className="seller-item-category">{item.category.name}</span>
                    )}
                    <h3 className="seller-item-title">
                      <Link to={`/listings/${item._id}`}>{item.title}</Link>
                    </h3>

                    <div className="seller-item-price-row">
                      <span className="seller-item-price">{formatPrice(item.price)}</span>
                      {item.location?.city && (
                        <span className="seller-item-city">
                          <MapPin size={12} /> {item.location.city}
                        </span>
                      )}
                    </div>

                    <div className="seller-item-footer">
                      <button
                        onClick={() => setActiveChatListing(item)}
                        className="btn-item-chat"
                        title="Chat about this item"
                      >
                        <MessageSquare size={14} /> Chat
                      </button>
                      <Link to={`/listings/${item._id}`} className="btn-item-view">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
