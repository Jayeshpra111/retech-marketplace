import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import '../styles/pages.css';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, addOrder } = useApp();

  const listing = listings.find(l => l.id === id) || listings[0];

  const [fullName, setFullName] = useState('Jayesh Patel');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine, setAddressLine] = useState('Flat 402, Green Glen Layout, Bellandur');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560103');
  const [paymentMethod, setPaymentMethod] = useState('escrow_online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const shippingFee = 250;
  const totalAmount = listing.price + (paymentMethod === 'escrow_online' ? shippingFee : 0);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        listingId: listing.id,
        title: listing.title,
        amount: totalAmount,
        sellerName: listing.seller.name,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0],
        trackingNumber: `RETECH-TRACK-${Date.now().toString().slice(-6)}`,
        protectionStatus: paymentMethod === 'escrow_online' ? 'Escrow Held (Funds release on your delivery confirmation)' : 'Cash on Delivery (Local Meetup)',
        image: listing.images[0],
        co2Saved: listing.co2SavedKg || 45
      };

      addOrder(newOrder);
      setIsProcessing(false);
      setOrderComplete(newOrder);
    }, 1800);
  };

  if (orderComplete) {
    return (
      <div className="checkout-complete">
        <div className="checkout-complete__icon">
          <CheckCircle2 className="checkout-icon checkout-icon--success" />
        </div>

        <div className="checkout-complete__message">
          <span className="checkout-complete__eyebrow">Payment Confirmed</span>
          <h1 className="checkout-complete__title">
            Order #{orderComplete.id} Placed Successfully!
          </h1>
          <p className="checkout-complete__summary">
            Your funds are securely held in <strong>Escrow</strong>. The seller has been notified to package and ship with tracking.
          </p>
        </div>

        <div className="checkout-complete__receipt">
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Item</span>
            <span className="checkout-complete__receipt-value">{orderComplete.title}</span>
          </div>
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Amount Paid</span>
            <span className="checkout-complete__receipt-value checkout-complete__receipt-value--eco">{formatPrice(orderComplete.amount)}</span>
          </div>
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Tracking Code</span>
            <span className="checkout-complete__receipt-value checkout-complete__receipt-value--mono">{orderComplete.trackingNumber}</span>
          </div>
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">CO2 Impact Diverted</span>
            <span className="checkout-complete__receipt-value checkout-complete__receipt-value--impact">🌱 {orderComplete.co2Saved} kg CO2 Saved</span>
          </div>
        </div>

        <div className="checkout-complete__actions">
          <button
            onClick={() => navigate('/dashboard?tab=orders')}
            className="checkout-button checkout-button--primary"
          >
            Track in My Orders
          </button>
          <button
            onClick={() => navigate('/browse')}
            className="checkout-button checkout-button--secondary"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <div className="checkout-header">
        <Link to={`/listings/${listing.id}`} className="checkout-header__back">
          <ArrowLeft className="checkout-icon checkout-icon--medium" />
        </Link>
        <div>
          <h1 className="checkout-header__title">Secure Escrow Checkout</h1>
          <p className="checkout-header__summary">Protected under ReTech Buyer Guarantee (FR-9, FR-11)</p>
        </div>
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="checkout-guarantee">
        <div className="checkout-guarantee__icon">
          <ShieldCheck className="checkout-icon checkout-icon--large" />
        </div>
        <div className="checkout-guarantee__copy">
          <h4 className="checkout-guarantee__title">100% Escrow Protection Guarantee</h4>
          <p className="checkout-guarantee__text">
            Your money stays in escrow. It will not be released to seller <strong>{listing.seller.name}</strong> until you receive the package, inspect functionality, and confirm delivery.
          </p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="checkout-layout">

        {/* Left Column: Address & Payment Method (7 cols) */}
        <div className="checkout-main-column">

          {/* Shipping Address */}
          <div className="checkout-panel checkout-address">
            <h3 className="checkout-panel__title">
              <MapPin className="checkout-icon checkout-icon--small" />
              <span>Delivery Address</span>
            </h3>

            <div className="checkout-field-grid">
              <div>
                <label className="checkout-field-label">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="checkout-field"
                />
              </div>

              <div>
                <label className="checkout-field-label">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="checkout-field"
                />
              </div>
            </div>

            <div>
              <label className="checkout-field-label">Street Address</label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                required
                className="checkout-field"
              />
            </div>

            <div className="checkout-field-grid checkout-field-grid--address">
              <div>
                <label className="checkout-field-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="checkout-field"
                />
              </div>

              <div>
                <label className="checkout-field-label">Postal Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="checkout-field checkout-field--mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-panel checkout-payment">
            <h3 className="checkout-panel__title">
              <CreditCard className="checkout-icon checkout-icon--small" />
              <span>Select Payment Method</span>
            </h3>

            <div className="checkout-payment__options">
              <label
                onClick={() => setPaymentMethod('escrow_online')}
                className={`checkout-payment__option ${paymentMethod === 'escrow_online' ? 'is-selected' : ''}`}
              >
                <div className="checkout-payment__choice">
                  <input
                    type="radio"
                    checked={paymentMethod === 'escrow_online'}
                    onChange={() => { }}
                    className="checkout-payment__radio"
                  />
                  <div>
                    <span className="checkout-payment__name">Online Gateway (UPI, Cards, NetBanking)</span>
                    <span className={`checkout-payment__hint ${paymentMethod === 'escrow_online' ? 'is-selected' : ''}`}>
                      Held in Escrow until delivery is confirmed by you.
                    </span>
                  </div>
                </div>
                <span className={`checkout-payment__badge ${paymentMethod === 'escrow_online' ? 'is-selected' : ''}`}>
                  Protected
                </span>
              </label>

              <label
                onClick={() => setPaymentMethod('cod')}
                className={`checkout-payment__option ${paymentMethod === 'cod' ? 'is-selected' : ''}`}
              >
                <div className="checkout-payment__choice">
                  <input
                    type="radio"
                    checked={paymentMethod === 'cod'}
                    onChange={() => { }}
                    className="checkout-payment__radio"
                  />
                  <div>
                    <span className="checkout-payment__name">Cash on Local Meetup</span>
                    <span className={`checkout-payment__hint ${paymentMethod === 'cod' ? 'is-selected' : ''}`}>
                      Inspect in person in {listing.city}. No escrow protection.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="checkout-summary-column">
          <div className="checkout-panel checkout-summary">
            <h3 className="checkout-panel__title checkout-summary__title">
              Order Summary
            </h3>

            {/* Listing snapshot */}
            <div className="checkout-summary__listing">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="checkout-summary__image"
              />
              <div className="checkout-summary__listing-copy">
                <p className="checkout-summary__listing-title">{listing.title}</p>
                <p className="checkout-summary__condition">Condition: {listing.condition}</p>
                <p className="checkout-summary__price">{formatPrice(listing.price)}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="checkout-summary__breakdown">
              <div className="checkout-summary__row">
                <span>Item Subtotal</span>
                <span className="checkout-summary__amount">{formatPrice(listing.price)}</span>
              </div>
              <div className="checkout-summary__row">
                <span>Insured Courier Shipping</span>
                <span className="checkout-summary__amount">
                  {paymentMethod === 'escrow_online' ? formatPrice(shippingFee) : 'Free Local Handshake'}
                </span>
              </div>
              <div className="checkout-summary__row checkout-summary__row--eco">
                <span>Circular Marketplace Fee</span>
                <span className="checkout-summary__amount checkout-summary__amount--bold">₹0 (Free in v1)</span>
              </div>
            </div>

            {/* Total */}
            <div className="checkout-summary__total">
              <span className="checkout-summary__total-label">Total to Pay</span>
              <span className="checkout-summary__total-value">
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="checkout-submit"
            >
              {isProcessing ? (
                <span>Locking Escrow Deposit...</span>
              ) : (
                <>
                  <Lock className="checkout-icon checkout-icon--small" />
                  <span>Confirm & Authorize {formatPrice(totalAmount)}</span>
                </>
              )}
            </button>

            <div className="checkout-security-note">
              <Lock className="checkout-icon checkout-icon--tiny" />
              <span>256-Bit SSL Encrypted & RBI Verified</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
