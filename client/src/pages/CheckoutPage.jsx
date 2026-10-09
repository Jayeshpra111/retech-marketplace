import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import '../styles/pages.css';

// Helper to dynamically load external scripts like Razorpay
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get('offerId');
  const navigate = useNavigate();
  const { listings, user } = useApp();

  const [listing, setListing] = useState(() => listings.find((l) => l.id === id || l._id === id) || null);
  const [isLoadingListing, setIsLoadingListing] = useState(!listing);

  // Address and payment state initialized from logged-in user profile
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address?.line1 || '');
  const [city, setCity] = useState(user?.address?.city || 'Bangalore');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [paymentMethod, setPaymentMethod] = useState('escrow_online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Fetch fresh listing from backend if not in cache
  useEffect(() => {
    if (id) {
      api.listings
        .getById(id)
        .then((res) => {
          if (res?.data) setListing(res.data);
        })
        .catch(() => {})
        .finally(() => setIsLoadingListing(false));
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!phone) setPhone(user.phone || '');
      if (!city && user.address?.city) setCity(user.address.city);
      if (!pincode && user.address?.pincode) setPincode(user.address.pincode);
    }
  }, [user]);

  if (isLoadingListing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
        <h2>Listing Not Found</h2>
        <p style={{ color: '#6B7280', margin: '8px 0 24px' }}>This item might have already been purchased or removed.</p>
        <Link to="/browse" className="checkout-button checkout-button--primary">
          Back to Browse
        </Link>
      </div>
    );
  }

  const shippingFee = paymentMethod === 'escrow_online' ? 250 : 0;
  const itemPrice = listing.price || 0;
  const totalAmount = itemPrice + shippingFee;

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim()) {
      toast.error('Please fill in all delivery address details.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create real order on backend
      const orderPayload = {
        listingId: listing._id || listing.id,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          line1: addressLine.trim(),
          city: city.trim(),
          state: 'KA',
          pincode: pincode.trim(),
        },
        paymentMethod: paymentMethod === 'escrow_online' ? 'online' : 'cod',
        ...(offerId ? { offerId } : {}),
      };

      const orderRes = await api.orders.create(orderPayload);
      const createdOrder = orderRes?.data;

      if (!createdOrder) {
        throw new Error('Failed to create order on server.');
      }

      // 2. If Cash on Delivery, order is confirmed immediately
      if (paymentMethod === 'cod') {
        setIsProcessing(false);
        setOrderComplete({
          id: createdOrder._id,
          title: listing.title,
          amount: totalAmount,
          trackingNumber: 'LOCAL-HANDSHAKE',
          co2Saved: listing.co2SavedKg || 45,
          status: 'confirmed',
          paymentMethod: 'cod',
        });
        toast.success('Order placed successfully for local pickup!');
        return;
      }

      // 3. Online Escrow Payment via Razorpay
      const paymentRes = await api.payments.create(createdOrder._id);
      const paymentData = paymentRes?.data;

      if (!paymentData) {
        throw new Error('Failed to initiate escrow payment.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway SDK. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // Check if real key or development fallback
      if (paymentData.keyId && !paymentData.keyId.startsWith('mock_')) {
        const rzpOptions = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'INR',
          name: 'ReTech Market',
          description: `Escrow Guarantee Payment for ${listing.title}`,
          order_id: paymentData.gatewayOrderId,
          prefill: {
            name: fullName,
            contact: phone,
            email: user?.email,
          },
          theme: {
            color: '#10B981',
          },
          handler: async function (response) {
            try {
              await api.payments.verify({
                orderId: createdOrder._id,
                gatewayPaymentId: response.razorpay_payment_id,
                gatewayOrderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });

              setIsProcessing(false);
              setOrderComplete({
                id: createdOrder._id,
                title: listing.title,
                amount: totalAmount,
                trackingNumber: createdOrder.gatewayOrderId || `RETECH-ESCROW-${createdOrder._id.slice(-6)}`,
                co2Saved: listing.co2SavedKg || 45,
                status: 'paid',
                paymentMethod: 'online',
              });
              toast.success('Payment verified and held safely in Escrow!');
            } catch (verifyErr) {
              toast.error(verifyErr.message || 'Payment verification failed.');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast('Payment cancelled. Your order remains pending in dashboard.');
            },
          },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      } else {
        // Development / Test mode without Razorpay key configured
        toast.success('Dev Mode: Order registered. Complete payment once keys are configured.');
        setIsProcessing(false);
        setOrderComplete({
          id: createdOrder._id,
          title: listing.title,
          amount: totalAmount,
          trackingNumber: `DEV-ORDER-${createdOrder._id.slice(-6)}`,
          co2Saved: listing.co2SavedKg || 45,
          status: 'pending',
          paymentMethod: 'online',
        });
      }
    } catch (err) {
      setIsProcessing(false);
      toast.error(err.message || 'Failed to process checkout.');
    }
  };

  if (orderComplete) {
    return (
      <div className="checkout-complete">
        <div className="checkout-complete__icon">
          <CheckCircle2 className="checkout-icon checkout-icon--success" />
        </div>

        <div className="checkout-complete__message">
          <span className="checkout-complete__eyebrow">
            {orderComplete.paymentMethod === 'cod' ? 'Order Confirmed' : 'Payment Held in Escrow'}
          </span>
          <h1 className="checkout-complete__title">Order #{orderComplete.id.slice(-8)} Placed Successfully!</h1>
          <p className="checkout-complete__summary">
            {orderComplete.paymentMethod === 'cod'
              ? 'Your local meetup order is confirmed. Coordinate pickup time and location with the seller.'
              : 'Your payment is securely held in Escrow. Funds are released only after you receive and confirm the item.'}
          </p>
        </div>

        <div className="checkout-complete__receipt">
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Item</span>
            <span className="checkout-complete__receipt-value">{orderComplete.title}</span>
          </div>
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Amount</span>
            <span className="checkout-complete__receipt-value checkout-complete__receipt-value--eco">
              {formatPrice(orderComplete.amount)}
            </span>
          </div>
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Tracking / Order Reference</span>
            <span className="checkout-complete__receipt-value checkout-complete__receipt-value--mono">
              {orderComplete.trackingNumber}
            </span>
          </div>
          <div className="checkout-complete__receipt-row">
            <span className="checkout-complete__receipt-label">Environmental Impact</span>
            <span className="checkout-complete__receipt-value checkout-complete__receipt-value--impact">
              🌱 {orderComplete.co2Saved} kg CO2 Diverted
            </span>
          </div>
        </div>

        <div className="checkout-complete__actions">
          <button onClick={() => navigate('/dashboard')} className="checkout-button checkout-button--primary">
            Track in My Orders
          </button>
          <button onClick={() => navigate('/browse')} className="checkout-button checkout-button--secondary">
            Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  const sellerName = listing.seller?.name || 'Verified Seller';
  const mainImage =
    listing.images?.[0]?.url ||
    (typeof listing.images?.[0] === 'string' ? listing.images[0] : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600');

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <Link to={`/listings/${listing._id || listing.id}`} className="checkout-header__back">
          <ArrowLeft className="checkout-icon checkout-icon--medium" />
        </Link>
        <div>
          <h1 className="checkout-header__title">Secure Escrow Checkout</h1>
          <p className="checkout-header__summary">Protected under ReTech Buyer Escrow Guarantee</p>
        </div>
      </div>

      <div className="checkout-guarantee">
        <div className="checkout-guarantee__icon">
          <ShieldCheck className="checkout-icon checkout-icon--large" />
        </div>
        <div className="checkout-guarantee__copy">
          <h4 className="checkout-guarantee__title">100% Escrow Protection Guarantee</h4>
          <p className="checkout-guarantee__text">
            Your money stays in escrow. It will not be released to seller <strong>{sellerName}</strong> until you
            receive the package, inspect functionality, and confirm delivery.
          </p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        <div className="checkout-main-column">
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
                  placeholder="e.g. Rahul Sharma"
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
                  placeholder="+91 98765 43210"
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
                placeholder="House/Flat No., Building, Street Name"
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
                  placeholder="e.g. Bangalore"
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
                  placeholder="e.g. 560103"
                  required
                  className="checkout-field checkout-field--mono"
                />
              </div>
            </div>
          </div>

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
                    onChange={() => {}}
                    className="checkout-payment__radio"
                  />
                  <div>
                    <span className="checkout-payment__name">Online Escrow Gateway (UPI, Cards, NetBanking)</span>
                    <span className={`checkout-payment__hint ${paymentMethod === 'escrow_online' ? 'is-selected' : ''}`}>
                      Held securely in Escrow until delivery is inspected & confirmed by you.
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
                    onChange={() => {}}
                    className="checkout-payment__radio"
                  />
                  <div>
                    <span className="checkout-payment__name">Cash on Local Meetup</span>
                    <span className={`checkout-payment__hint ${paymentMethod === 'cod' ? 'is-selected' : ''}`}>
                      Inspect in person in {listing.location?.city || listing.city || 'your city'}. No escrow protection.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="checkout-summary-column">
          <div className="checkout-panel checkout-summary">
            <h3 className="checkout-panel__title checkout-summary__title">Order Summary</h3>

            <div className="checkout-summary__listing">
              <img src={mainImage} alt={listing.title} className="checkout-summary__image" />
              <div className="checkout-summary__listing-copy">
                <p className="checkout-summary__listing-title">{listing.title}</p>
                <p className="checkout-summary__condition">Condition: {listing.condition}</p>
                <p className="checkout-summary__price">{formatPrice(itemPrice)}</p>
              </div>
            </div>

            <div className="checkout-summary__breakdown">
              <div className="checkout-summary__row">
                <span>Item Subtotal</span>
                <span className="checkout-summary__amount">{formatPrice(itemPrice)}</span>
              </div>
              <div className="checkout-summary__row">
                <span>Insured Courier Shipping</span>
                <span className="checkout-summary__amount">
                  {paymentMethod === 'escrow_online' ? formatPrice(shippingFee) : 'Free Local Handshake'}
                </span>
              </div>
              <div className="checkout-summary__row checkout-summary__row--eco">
                <span>Circular Marketplace Fee</span>
                <span className="checkout-summary__amount checkout-summary__amount--bold">₹0 (Free)</span>
              </div>
            </div>

            <div className="checkout-summary__total">
              <span className="checkout-summary__total-label">Total to Pay</span>
              <span className="checkout-summary__total-value">{formatPrice(totalAmount)}</span>
            </div>

            <button type="submit" disabled={isProcessing} className="checkout-submit">
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
              <span>256-Bit SSL Encrypted Escrow Account</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
