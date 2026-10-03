import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  MapPin,
  Star,
  MessageSquare,
  Zap,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Leaf,
  Clock,
  FileText,
  Package,
  Flag,
  ChevronRight,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CONDITION_GRADES } from '../data/mockData';
import ConditionModal from '../components/ConditionModal';
import api from '../services/api';
import '../styles/pages.css';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, wishlist, toggleWishlist, setActiveChatListing } = useApp();

  const localListing = listings.find(l => l.id === id || l._id === id);
  const [fetchedListing, setFetchedListing] = useState(null);

  React.useEffect(() => {
    if (!localListing && id) {
      api.listings.getById(id)
        .then(res => {
          if (res?.data) {
            const l = res.data;
            setFetchedListing({
              id: l._id || l.id,
              title: l.title,
              category: l.category?.slug || l.category?.name || 'Electronics',
              price: l.price,
              originalPrice: l.originalPrice || l.price * 1.4,
              condition: l.condition,
              seller: {
                name: l.seller?.name || 'Verified Seller',
                rating: l.seller?.ratingAvg || 4.9,
                reviewCount: l.seller?.ratingCount || 12,
                verified: l.seller?.isEmailVerified ?? true,
              },
              city: `${l.location?.city || 'Bangalore'}, ${l.location?.state || 'KA'}`,
              location: `${l.location?.city || 'Bangalore'}, ${l.location?.state || 'KA'}`,
              images: l.images?.length > 0 ? l.images.map(i => i.url || i) : [
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'
              ],
              specs: l.specs || {},
              verified: true,
              impactKg: l.impactKg || 1.5,
              co2SavedKg: l.co2SavedKg || 65,
              warrantyLeftMonths: l.warrantyLeftMonths || 0,
              hasBill: l.hasBill ?? true,
              description: l.description,
              brand: l.brand,
              model: l.model,
            });
          }
        })
        .catch(() => { });
    }
  }, [id, localListing]);

  const listing = localListing || fetchedListing || listings[0];
  const [selectedImage, setSelectedImage] = useState(0);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(Math.round((listing?.price || 1000) * 0.9));
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('condition');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isWishlisted = wishlist.includes(listing.id);
  const conditionInfo = CONDITION_GRADES[listing.condition] || CONDITION_GRADES.good;
  const city = listing.city || (typeof listing.location === 'string' ? listing.location : listing.location?.city) || 'Location unavailable';

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleMakeOffer = (e) => {
    e.preventDefault();
    setOfferSubmitted(true);
    setTimeout(() => {
      setIsOfferModalOpen(false);
      setOfferSubmitted(false);
    }, 2000);
  };

  const handleReport = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
    }, 2000);
  };

  return (
    <div className="listing-detail-page">

      {/* Breadcrumb Navigation */}
      <div className="listing-breadcrumb">
        <Link to="/" className="listing-breadcrumb__link">Home</Link>
        <ChevronRight className="detail-icon detail-icon--tiny" />
        <Link to="/browse" className="listing-breadcrumb__link">Browse</Link>
        <ChevronRight className="detail-icon detail-icon--tiny" />
        <span className="listing-breadcrumb__current">{listing.title}</span>
      </div>

      {/* Main Listing View (Gallery + Buy Box) */}
      <div className="listing-detail-layout">

        {/* Left Column: Image Gallery (7 cols) */}
        <div className="listing-gallery-column">
          {/* Main Display Image */}
          <div className="listing-gallery__main">
            <img
              src={listing.images[selectedImage] || listing.images[0]}
              alt={listing.title}
              className="listing-gallery__image"
            />
            {/* Condition Badge in image */}
            <div className="listing-gallery__condition-position">
              <button
                onClick={() => setIsConditionModalOpen(true)}
                className={`listing-gallery__condition listing-gallery__condition--${listing.condition || 'good'}`}
              >
                <span className={`listing-gallery__condition-dot listing-gallery__condition-dot--${listing.condition || 'good'}`}></span>
                <span>{conditionInfo.label}</span>
              </button>
            </div>

            {/* Environmental Saving Flag */}
            <div className="listing-gallery__impact-position">
              <span className="listing-gallery__impact">
                <Leaf className="detail-icon detail-icon--small" />
                <span>Prevents ~{listing.impactKg} kg e-waste</span>
              </span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {listing.images.length > 1 && (
            <div className="listing-gallery__thumbnails">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`listing-gallery__thumbnail ${selectedImage === idx ? 'is-selected' : ''}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="listing-gallery__thumbnail-image" />
                </button>
              ))}
            </div>
          )}

          {/* Environmental Impact Breakdown Banner */}
          <div className="listing-impact-panel">
            <div className="listing-impact-panel__content">
              <div className="listing-impact-panel__icon">
                <Leaf className="detail-icon detail-icon--medium" />
              </div>
              <div className="listing-impact-panel__copy">
                <h4 className="listing-impact-panel__title">
                  Circular Impact: Keeps {listing.impactKg} kg of toxic e-waste out of landfills
                </h4>
                <p className="listing-impact-panel__description">
                  By recirculating this hardware instead of buying brand new, you also avoid an estimated <strong>{listing.co2SavedKg} kg of CO2 emissions</strong> in mining, silicon wafer fabrication, and logistics.
                </p>
                <Link to="/impact" className="listing-impact-panel__link">
                  View how ReTech calculates embodied carbon →
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Purchase Box (5 cols) */}
        <div className="listing-purchase-column">

          {/* Header & Meta */}
          <div className="listing-heading">
            <div className="listing-heading__meta">
              <span className="listing-heading__brand">
                {listing.brand} • {listing.model}
              </span>
              <span className="listing-heading__date">
                <Clock className="detail-icon detail-icon--tiny" /> Listed {listing.createdAt}
              </span>
            </div>

            <h1 className="listing-heading__title">
              {listing.title}
            </h1>

            <div className="listing-heading__location">
              <MapPin className="detail-icon detail-icon--small detail-icon--muted" />
              <span>{city}</span>
              <span>•</span>
              <span className="listing-heading__views">{listing.views} views</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="listing-price-panel">
            <div className="listing-price-panel__row">
              <div>
                <span className="listing-price-panel__price">
                  {formatPrice(listing.price)}
                </span>
                {listing.originalPrice && (
                  <span className="listing-price-panel__original">
                    {formatPrice(listing.originalPrice)}
                  </span>
                )}
              </div>
              {listing.isNegotiable ? (
                <span className="listing-price-panel__negotiable">
                  Offers Welcome
                </span>
              ) : (
                <span className="listing-price-panel__fixed">
                  Fixed Price
                </span>
              )}
            </div>

            <p className="listing-price-panel__note">
              *All platform transactions are covered by Escrow Protection until you test the item.
            </p>
          </div>

          {/* Key Checklist Badges */}
          <div className="listing-checklist">
            <div className="listing-checklist__item">
              <FileText className="detail-icon detail-icon--small detail-icon--eco" />
              <span>{listing.hasBill ? 'Invoice Available' : 'No Bill / Invoice'}</span>
            </div>
            <div className="listing-checklist__item">
              <Package className="detail-icon detail-icon--small detail-icon--eco" />
              <span>{listing.hasBox ? 'Original Box Included' : 'Box Not Included'}</span>
            </div>
            <div className="listing-checklist__item">
              <ShieldCheck className="detail-icon detail-icon--small detail-icon--blue" />
              <span>Warranty: {listing.warranty}</span>
            </div>
            <div className="listing-checklist__item">
              <Clock className="detail-icon detail-icon--small detail-icon--amber" />
              <span>Device Age: {listing.age}</span>
            </div>
          </div>

          {/* Main Action CTAs */}
          <div className="listing-actions">

            <button
              onClick={() => navigate(`/checkout/${listing.id}`)}
              className="listing-actions__buy"
            >
              <ShieldCheck className="detail-icon detail-icon--medium" />
              <span>Buy Now with Escrow Protection</span>
            </button>

            <div className="listing-actions__secondary">
              <button
                onClick={() => setActiveChatListing(listing)}
                className="listing-actions__button"
              >
                <MessageSquare className="detail-icon detail-icon--small" />
                <span>Chat with Seller</span>
              </button>

              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="listing-actions__button"
              >
                <Zap className="detail-icon detail-icon--small detail-icon--amber" />
                <span>Make an Offer</span>
              </button>
            </div>

            <div className="listing-actions__utility">
              <button
                onClick={() => toggleWishlist(listing.id)}
                className="listing-actions__wishlist"
              >
                <Heart className={`detail-icon detail-icon--small ${isWishlisted ? 'is-saved' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="listing-actions__report"
              >
                <Flag className="detail-icon detail-icon--tiny" />
                <span>Report listing</span>
              </button>
            </div>

          </div>

          {/* Seller Profile Card */}
          <div className="listing-seller-panel">
            <div className="listing-seller-panel__header">
              <div className="listing-seller-panel__identity">
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="listing-seller-panel__avatar"
                />
                <div>
                  <h4 className="listing-seller-panel__name">
                    <span>{listing.seller.name}</span>
                    {listing.seller.verified && (
                      <span className="listing-seller-panel__verified">
                        <ShieldCheck className="detail-icon detail-icon--tiny" /> Verified ID
                      </span>
                    )}
                  </h4>
                  <p className="listing-seller-panel__member">Member since {listing.seller.memberSince}</p>
                </div>
              </div>

              <div className="listing-seller-panel__rating-wrap">
                <div className="listing-seller-panel__rating">
                  <Star className="detail-icon detail-icon--small" />
                  <span>{listing.seller.rating}</span>
                </div>
                <span className="listing-seller-panel__reviews">({listing.seller.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="listing-seller-panel__footer">
              <span>Avg. Response: <strong>{listing.seller.responseTime}</strong></span>
              <button
                onClick={() => setActiveChatListing(listing)}
                className="listing-seller-panel__message"
              >
                Send Message →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Description & Technical Specifications Section */}
      <div className="listing-details-layout">

        {/* Left Column: Description & For Parts Breakdown */}
        <div className="listing-details-main">

          {/* For Parts / Broken Device Special Section (PRD 4.1 #13) */}
          {listing.condition === 'for_parts' && (
            <div className="listing-salvage-panel">
              <div className="listing-salvage-panel__title">
                <Wrench className="detail-icon detail-icon--medium" />
                <h3>Circular Salvage Breakdown: What Works vs What is Broken</h3>
              </div>
              <p className="listing-salvage-panel__summary">
                This item is listed under <strong>For Parts / Salvage</strong>. Review the functioning donor components before purchasing.
              </p>

              <div className="listing-salvage-panel__columns">
                <div className="listing-salvage-panel__card listing-salvage-panel__card--working">
                  <h4 className="listing-salvage-panel__card-title">
                    <CheckCircle2 className="detail-icon detail-icon--small" />
                    <span>Tested & Operational Parts</span>
                  </h4>
                  <p className="listing-salvage-panel__card-copy">
                    {listing.whatWorks || 'Core processor and motherboard operational.'}
                  </p>
                </div>

                <div className="listing-salvage-panel__card listing-salvage-panel__card--broken">
                  <h4 className="listing-salvage-panel__card-title">
                    <AlertTriangle className="detail-icon detail-icon--small" />
                    <span>Faulty / Broken Components</span>
                  </h4>
                  <p className="listing-salvage-panel__card-copy">
                    {listing.whatBroken || 'Screen damaged / needs replacement.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="listing-description">
            <h3 className="listing-description__title">Seller's Detailed Description</h3>
            <p className="listing-description__text">
              {listing.conditionDetails}
            </p>
          </div>

          {/* Included Accessories */}
          {listing.accessories && listing.accessories.length > 0 && (
            <div className="listing-accessories">
              <h3 className="listing-accessories__title">Accessories Included</h3>
              <div className="listing-accessories__list">
                {listing.accessories.map((acc, i) => (
                  <span key={i} className="listing-accessories__item">
                    <CheckCircle2 className="detail-icon detail-icon--tiny detail-icon--eco" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Hardware & Compatibility Specs (PRD 4.1 #12) */}
        <div className="listing-details-aside">
          <div className="listing-specs-panel">
            <div className="listing-specs-panel__heading">
              <Cpu className="detail-icon detail-icon--medium detail-icon--blue" />
              <h3>Technical Specifications</h3>
            </div>
            <p className="listing-specs-panel__summary">
              Verified specifications and system compatibility metrics.
            </p>

            <div className="listing-specs-list">
              {Object.entries(listing.specs || {}).map(([key, val]) => (
                <div key={key} className="listing-specs-list__row">
                  <span className="listing-specs-list__key">{key}</span>
                  <span className="listing-specs-list__value">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Data-Wipe Guarantee Box */}
          <div className="listing-privacy-panel">
            <h4 className="listing-privacy-panel__title">
              <ShieldCheck className="detail-icon detail-icon--small detail-icon--eco" />
              ReTech Trust & Privacy Assurance
            </h4>
            <ul className="listing-privacy-panel__list">
              <li>Serial Number & IMEI stored securely and verified against anti-theft registries.</li>
              <li>Sellers must complete cryptographic wipe verification prior to dispatch.</li>
              <li>Local meetup advice: inspect battery health and screen in public spaces.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Make Offer Modal */}
      {isOfferModalOpen && (
        <div className="listing-modal-backdrop">
          <div className="listing-modal">
            <h3 className="listing-modal__title">Make an Offer to {listing.seller.name}</h3>
            <p className="listing-modal__summary">
              Current asking price is <strong>{formatPrice(listing.price)}</strong>.
            </p>

            {offerSubmitted ? (
              <div className="listing-modal__success">
                ✓ Offer of {formatPrice(offerPrice)} submitted! The seller has been notified via chat.
              </div>
            ) : (
              <form onSubmit={handleMakeOffer} className="listing-modal__form">
                <div>
                  <label className="listing-modal__label">Your Offer Price (INR)</label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    min={Math.round(listing.price * 0.5)}
                    max={listing.price}
                    className="listing-modal__field"
                  />
                  <span className="listing-modal__hint">
                    Suggested fair range: {formatPrice(listing.price * 0.85)} - {formatPrice(listing.price * 0.95)}
                  </span>
                </div>

                <div className="listing-modal__actions">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="listing-modal__cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="listing-modal__submit"
                  >
                    Send Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      {reportModalOpen && (
        <div className="listing-modal-backdrop">
          <div className="listing-modal">
            <h3 className="listing-modal__title">Report Listing</h3>
            <p className="listing-modal__summary">
              Help keep ReTech safe. Submissions are reviewed by our trust & safety team within 2 hours.
            </p>

            {reportSubmitted ? (
              <div className="listing-modal__success">
                ✓ Report logged. Thank you for keeping circular electronics trustworthy.
              </div>
            ) : (
              <form onSubmit={handleReport} className="listing-modal__form">
                <div>
                  <label className="listing-modal__label">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="listing-modal__select"
                  >
                    <option value="condition">Inaccurate condition grade</option>
                    <option value="stolen">Suspicion of lost / stolen device</option>
                    <option value="counterfeit">Counterfeit / Fake brand</option>
                    <option value="overpriced">Scam or phishing behavior</option>
                  </select>
                </div>

                <div className="listing-modal__actions">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="listing-modal__cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="listing-modal__submit listing-modal__submit--danger"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Condition Modal */}
      <ConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
      />

    </div>
  );
}
