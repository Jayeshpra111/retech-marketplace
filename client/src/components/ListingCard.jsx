import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Wrench, ShieldCheck, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CONDITION_GRADES } from '../data/mockData';
import '../styles/components.css';

export default function ListingCard({ listing }) {
  const { wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(listing.id);
  const conditionInfo = CONDITION_GRADES[listing.condition] || CONDITION_GRADES.good;
  const city = listing.city || (typeof listing.location === 'string' ? listing.location : listing.location?.city) || 'Location unavailable';
  const seller = typeof listing.seller === 'object' && listing.seller !== null
    ? listing.seller
    : {
      name: listing.seller || 'Seller',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: listing.sellerRating || 4.8,
      verified: listing.sellerVerified ?? false,
    };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="listing-card">

      {/* Image & Badges Container */}
      <div className="listing-card__media">
        <Link to={`/listings/${listing.id}`}>
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="listing-card__image"
          />
        </Link>

        {/* Condition Grade Badge (Top Left) */}
        <div className="listing-card__condition-position">
          <span className={`listing-card__condition listing-card__condition--${listing.condition || 'good'}`}>
            <span className={`listing-card__condition-dot listing-card__condition-dot--${listing.condition || 'good'}`}></span>
            {conditionInfo.label}
          </span>
        </div>

        {/* Wishlist Heart Button (Top Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(listing.id);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`listing-card__favorite ${isWishlisted ? 'is-saved' : ''}`}
        >
          <Heart className="listing-card__favorite-icon" />
        </button>

        {/* For Parts / Needs Repair Overlay Badge */}
        {listing.condition === 'for_parts' && (
          <div className="listing-card__salvage-position">
            <span className="listing-card__salvage-badge">
              <Wrench className="listing-card__salvage-icon" />
              <span>Working parts salvage</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="listing-card__body">
        <div>
          {/* Eco Impact Chip */}
          <div className="listing-card__meta">
            <span className="listing-card__impact">
              <Leaf className="listing-card__impact-icon" />
              <span>Saves ~{listing.impactKg} kg e-waste</span>
            </span>
            <span className="listing-card__city">
              {city.split(',')[0]}
            </span>
          </div>

          {/* Title */}
          <Link to={`/listings/${listing.id}`}>
            <h3 className="listing-card__title">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Pricing, Seller & Footer */}
        <div className="listing-card__footer">
          <div className="listing-card__price-row">
            <div>
              <span className="listing-card__price">
                {formatPrice(listing.price)}
              </span>
              {listing.originalPrice && (
                <span className="listing-card__original-price">
                  {formatPrice(listing.originalPrice)}
                </span>
              )}
            </div>
            {listing.isNegotiable && (
              <span className="listing-card__negotiable">
                Negotiable
              </span>
            )}
          </div>

          <div className="listing-card__seller-row">
            <div className="listing-card__seller">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="listing-card__seller-avatar"
              />
              <span className="listing-card__seller-name">
                {seller.name}
              </span>
              {seller.verified && (
                <ShieldCheck className="listing-card__verified" title="Verified Seller" />
              )}
            </div>

            <div className="listing-card__rating">
              <Star className="listing-card__rating-icon" />
              <span>{seller.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
