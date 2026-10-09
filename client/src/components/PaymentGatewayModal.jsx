import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function PaymentGatewayModal({
  order,
  itemTitle,
  amount,
  sellerName,
  isOpen,
  onClose,
  onSuccess,
  onDiscard,
}) {
  const [method, setMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardHolder, setCardHolder] = useState('Authorized Buyer');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  if (!isOpen || !order) return null;

  const orderId = order._id || order.id;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || order.priceAtPurchase || order.amount || 0);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      if (method === 'cod') {
        // Update order status/payment method to COD
        await api.orders.updateStatus(orderId, {
          status: 'confirmed',
          paymentMethod: 'cod',
        });
        toast.success('Order confirmed with Cash on Local Meetup!');
        setIsProcessing(false);
        if (onSuccess) onSuccess({ ...order, paymentMethod: 'cod', orderStatus: 'confirmed' });
        onClose();
        return;
      }

      // Online Escrow Payment flow
      let paymentData;
      try {
        const pRes = await api.payments.create(orderId);
        paymentData = pRes?.data;
      } catch (pErr) {
        // If already created or pending
        console.warn('Payment order create response:', pErr);
      }

      const gatewayOrderId = paymentData?.gatewayOrderId || order.gatewayOrderId || `order_dev_${Date.now()}`;
      const gatewayPaymentId = `pay_escrow_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Simulate realistic payment authorization handshake
      await new Promise((res) => setTimeout(res, 900));

      // Verify payment with server
      await api.payments.verify({
        orderId,
        gatewayPaymentId,
        gatewayOrderId,
        signature: 'dev_verified_escrow_signature',
      });

      toast.success(`Payment authorized! ${formattedAmount} safely held in Escrow.`);
      setIsProcessing(false);
      if (onSuccess) onSuccess({ ...order, paymentStatus: 'held', orderStatus: 'paid' });
      onClose();
    } catch (err) {
      setIsProcessing(false);
      toast.error(err.message || 'Payment processing failed. Please try again.');
    }
  };

  const handleCancelAndDiscard = async () => {
    if (!window.confirm('Are you sure you want to discard this order? The item will be made available for other buyers.')) {
      return;
    }

    setIsDiscarding(true);
    try {
      try {
        await api.orders.delete(orderId);
      } catch {
        await api.orders.cancel(orderId);
      }
      toast.success('Order discarded and cancelled successfully.');
      setIsDiscarding(false);
      if (onDiscard) onDiscard(orderId);
      onClose();
    } catch (err) {
      setIsDiscarding(false);
      toast.error(err.message || 'Failed to discard order.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          maxWidth: '560px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} color="#34d399" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                  ReTech Escrow Payment
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#a7f3d0' }}>
                  100% Protected Buyer Guarantee
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing || isDiscarding}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              marginTop: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block' }}>
                Item: {itemTitle || 'Selected Product'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Seller: {sellerName || 'Verified Seller'}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'block' }}>Total to Lock</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                {formattedAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          <p style={{ margin: '0 0 0.875rem 0', fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>
            SELECT PAYMENT & ACCEPTANCE METHOD:
          </p>

          {/* Payment Method Selector Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            {[
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'card', label: 'Cards', icon: CreditCard },
              { id: 'netbanking', label: 'NetBanking', icon: Building2 },
              { id: 'cod', label: 'Cash (COD)', icon: Banknote },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = method === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMethod(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem 0.25rem',
                    borderRadius: '0.625rem',
                    border: isSel ? '2px solid #059669' : '1px solid #e2e8f0',
                    backgroundColor: isSel ? '#ecfdf5' : '#f8fafc',
                    color: isSel ? '#065f46' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: isSel ? 700 : 500,
                    fontSize: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={18} color={isSel ? '#059669' : '#64748b'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content 1: UPI */}
          {method === 'upi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Instant Escrow Deposit via Popular UPI Apps:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'gpay', name: 'Google Pay' },
                  { id: 'phonepe', name: 'PhonePe' },
                  { id: 'paytm', name: 'Paytm' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: selectedApp === app.id ? '2px solid #059669' : '1px solid #e2e8f0',
                      backgroundColor: selectedApp === app.id ? '#f0fdf4' : '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: selectedApp === app.id ? '#047857' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {app.name}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                  Or enter UPI ID / VPA
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Tab Content 2: Cards */}
          {method === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    letterSpacing: '1px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                    Valid Thru (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: NetBanking */}
          {method === 'netbanking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Choose Bank:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: selectedBank === b ? '2px solid #059669' : '1px solid #e2e8f0',
                      backgroundColor: selectedBank === b ? '#f0fdf4' : '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: selectedBank === b ? '#047857' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 4: COD */}
          {method === 'cod' && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Banknote size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#92400e', fontWeight: 700 }}>
                    Cash on Local Handshake
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#b45309', lineHeight: 1.4 }}>
                    You will inspect the electronic device in person and hand over cash directly to the seller.
                    Note: Escrow money-back guarantee does not cover physical cash handovers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Escrow Guarantee Disclaimer */}
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '0.625rem',
              alignItems: 'center',
            }}
          >
            <Lock size={16} color="#059669" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
              Funds remain securely locked on ReTech until you test and confirm delivery. The seller does not receive payment until you approve.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={handleCancelAndDiscard}
            disabled={isProcessing || isDiscarding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.625rem 1rem',
              borderRadius: '0.625rem',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            <span>{isDiscarding ? 'Discarding...' : 'Discard Order'}</span>
          </button>

          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing || isDiscarding}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.625rem',
              border: 'none',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)',
              flex: 1,
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Securing Funds in Escrow...</span>
              </>
            ) : method === 'cod' ? (
              <>
                <CheckCircle2 size={16} />
                <span>Accept Cash Local Order</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Pay & Lock {formattedAmount} in Escrow</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
