import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Check, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Leaf, 
  Wrench, 
  Lock, 
  Trash2, 
  Sparkles,
  BatteryCharging,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CATEGORIES, CONDITION_GRADES } from '../data/mockData';
import toast from 'react-hot-toast';
import '../styles/pages.css';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addListing, user } = useApp();

  const isForPartsInitial = searchParams.get('forParts') === 'true';

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [category, setCategory] = useState(isForPartsInitial ? 'tablets' : 'laptops');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  
  const [condition, setCondition] = useState(isForPartsInitial ? 'for_parts' : 'good');
  const [conditionDetails, setConditionDetails] = useState('');
  const [age, setAge] = useState('1 year');
  const [warranty, setWarranty] = useState('Expired');
  const [hasBill, setHasBill] = useState(false);
  const [hasBox, setHasBox] = useState(false);
  const [city, setCity] = useState('Bangalore, KA');

  // Device Health Diagnostics (Prompt 1)
  const [deviceHealth, setDeviceHealth] = useState({
    batteryHealthPercent: 92,
    cycleCount: 180,
    chargesProperly: true,
    touchWorks: true,
    deadPixels: false,
    burnIn: false,
    scratches: 'none',
    smartStatus: 'healthy',
    camera: true,
    speakers: true,
    wifiBluetooth: true,
  });

  // For Parts breakdown
  const [whatWorks, setWhatWorks] = useState('');
  const [whatBroken, setWhatBroken] = useState('');

  // Photos & real file uploads
  const fileInputRef = React.useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
  ]);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 6 - imagePreviews.length;
    const newFiles = files.slice(0, remainingSlots);

    setImageFiles((prev) => [...prev, ...newFiles]);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newUrls]);
  };

  const removePhoto = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Data Wipe Checklist (Must all be checked)
  const [wipeChecklist, setWipeChecklist] = useState({
    signOutAccounts: false,
    removePasscode: false,
    factoryReset: false,
    removeSimSd: false,
  });

  const allWiped = Object.values(wipeChecklist).every(Boolean);

  // Calculate environmental diversion
  const catObj = CATEGORIES.find((c) => c.id === category);
  const estimatedImpactKg = catObj?.impactMultiplier
    ? Number((catObj.impactMultiplier * (condition === 'for_parts' ? 0.7 : 1.0)).toFixed(2))
    : 0.8;
  const estimatedCo2Saved = Math.round(estimatedImpactKg * 65);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemTitle = (title.trim() || `${brand || ''} ${model || ''}`).trim() || category || 'Electronic Item';
    const safeTitle = itemTitle.length >= 3 ? itemTitle : `${itemTitle} Item`;

    if (!price || Number(price) <= 0) {
      toast.error('Please provide a valid asking price.');
      return;
    }

    const safeDescription =
      conditionDetails && conditionDetails.length >= 10
        ? conditionDetails
        : `${safeTitle} in ${condition} condition. Certified and accurately graded for ReTech Circular Marketplace.`;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', safeTitle);
      formData.append('description', safeDescription);
      formData.append('category', category);
      formData.append('price', String(Number(price)));
      formData.append('condition', condition);
      if (brand) formData.append('brand', brand);
      if (model) formData.append('model', model);
      if (serialNumber) formData.append('serialNumber', serialNumber);
      formData.append('hasBill', String(hasBill));
      formData.append('location', JSON.stringify({ city: city || 'Bangalore', state: 'KA' }));

      // Attach real file blobs
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await addListing(formData);

      // Auto-attach Device Health Report (Prompt 1)
      if (res?._id || res?.id) {
        const listingId = res._id || res.id;
        try {
          const isPhoneOrLaptop = ['mobiles', 'phones', 'tablets', 'laptops', 'macbooks'].some(k => category.toLowerCase().includes(k));
          await api.listings.createHealthReport(listingId, {
            deviceType: isPhoneOrLaptop
              ? (category.includes('phone') || category.includes('mobile') ? 'phone' : 'laptop')
              : (category.includes('gpu') ? 'gpu' : 'component'),
            battery: {
              healthPercent: Number(deviceHealth.batteryHealthPercent) || 95,
              cycleCount: Number(deviceHealth.cycleCount) || 150,
              chargesProperly: Boolean(deviceHealth.chargesProperly),
            },
            screen: {
              touchWorks: Boolean(deviceHealth.touchWorks),
              deadPixels: Boolean(deviceHealth.deadPixels),
              burnIn: Boolean(deviceHealth.burnIn),
              scratches: deviceHealth.scratches || 'none',
            },
            storage: {
              smartStatus: deviceHealth.smartStatus || 'healthy',
            },
            camera: Boolean(deviceHealth.camera),
            speakers: Boolean(deviceHealth.speakers),
            wifiBluetooth: Boolean(deviceHealth.wifiBluetooth),
            notes: safeDescription,
          });
        } catch (healthErr) {
          console.warn('Could not attach health report:', healthErr.message);
        }
      }

      navigate('/dashboard?tab=listings');
    } catch (err) {
      // Error is caught and surfaced to user
      toast.error(err.message || 'Error publishing listing. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-listing-page">
      
      {/* Header */}
      <div className="create-listing-header">
        <span className="create-listing-header__badge">
          <Leaf className="create-listing-icon create-listing-icon--small" />
          Circular Listing Studio
        </span>
        <h1 className="create-listing-header__title">
          List Your Hardware or Device
        </h1>
        <p className="create-listing-header__summary">
          Sell whole devices, PC parts, or salvage items. Help keep e-waste in circulation.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="create-listing-stepper">
        <div className="create-listing-stepper__track"></div>
        {[
          { step: 1, name: 'Identity' },
          { step: 2, name: 'Condition' },
          { step: 3, name: 'Photos & Price' },
          { step: 4, name: 'Data Wipe' },
          { step: 5, name: 'Publish' }
        ].map((item) => (
          <div key={item.step} className="create-listing-stepper__item">
            <div
              className={`create-listing-stepper__number ${currentStep > item.step ? 'is-complete' : ''} ${currentStep === item.step ? 'is-current' : ''}`}
            >
              {currentStep > item.step ? <Check className="create-listing-icon create-listing-icon--small" /> : item.step}
            </div>
            <span className="create-listing-stepper__label">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="create-listing-form-panel">
        
        {/* Step 1: Identity & Category */}
        {currentStep === 1 && (
          <div className="create-listing-step">
            <h2 className="create-listing-step__title">Step 1: Category & Device Identification</h2>
            
            <div>
              <label className="create-listing-label">Select Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="create-listing-control"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-listing-field-grid">
              <div>
                <label className="create-listing-label">Brand / Manufacturer *</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, NVIDIA, ASUS, Corsair"
                  required
                  className="create-listing-control"
                />
              </div>

              <div>
                <label className="create-listing-label">Model *</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. MacBook Pro 14 M1, RTX 3080 FE"
                  required
                  className="create-listing-control"
                />
              </div>
            </div>

            <div>
              <label className="create-listing-label">Listing Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple MacBook Pro 14 M1 Pro 16GB / 512GB (Space Gray)"
                required
                className="create-listing-control"
              />
            </div>

            <div className="create-listing-privacy-field">
              <label className="create-listing-label">
                Serial Number / IMEI (Hidden from Public)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. C02GL4P7MD6T"
                className="create-listing-control create-listing-control--mono"
              />
              <p className="create-listing-privacy-note">
                <Lock className="create-listing-icon create-listing-icon--tiny" />
                Never shown publicly. Checked against loss/stolen registries to protect buyers and sellers.
              </p>
            </div>

            <div className="create-listing-step__actions create-listing-step__actions--end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="create-listing-button create-listing-button--dark"
              >
                <span>Continue to Condition</span>
                <ArrowRight className="create-listing-icon create-listing-icon--small" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Condition & Specs */}
        {currentStep === 2 && (
          <div className="create-listing-step">
            <h2 className="create-listing-step__title">Step 2: Condition & Technical Specifications</h2>

            <div>
              <label className="create-listing-label">Condition Grade *</label>
              <div className="create-condition-grid">
                {Object.entries(CONDITION_GRADES).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCondition(key)}
                    className={`create-condition-option ${condition === key ? 'is-selected' : ''}`}
                  >
                    <div className="create-condition-option__header">
                      <span className="create-condition-option__name">
                        <span className={`create-condition-option__dot ${info.dot}`}></span>
                        {info.label}
                      </span>
                      {key === 'for_parts' && (
                        <span className="create-condition-option__salvage">
                          Salvage
                        </span>
                      )}
                    </div>
                    <p className={`create-condition-option__description ${condition === key ? 'is-selected' : ''}`}>
                      {info.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* If For Parts or Needs Repair: What works / What is broken */}
            {(condition === 'for_parts' || condition === 'needs_repair') && (
              <div className="create-listing-salvage">
                <h3 className="create-listing-salvage__title">
                  <Wrench className="create-listing-icon create-listing-icon--small" />
                  <span>Salvage Transparency: What Works vs What is Broken</span>
                </h3>
                
                <div>
                  <label className="create-listing-label create-listing-label--salvage">
                    What components are still tested & working? *
                  </label>
                  <textarea
                    value={whatWorks}
                    onChange={(e) => setWhatWorks(e.target.value)}
                    placeholder="e.g. Motherboard boots normally, cameras undamaged, FaceID functional, 128GB flash healthy."
                    rows="2"
                    className="create-listing-control create-listing-control--salvage"
                  />
                </div>

                <div>
                  <label className="create-listing-label create-listing-label--salvage">
                    What is broken or damaged? *
                  </label>
                  <textarea
                    value={whatBroken}
                    onChange={(e) => setWhatBroken(e.target.value)}
                    placeholder="e.g. Glass cracked, digitizer ghost touches, battery degraded."
                    rows="2"
                    className="create-listing-control create-listing-control--salvage"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="create-listing-label">Detailed Description</label>
              <textarea
                value={conditionDetails}
                onChange={(e) => setConditionDetails(e.target.value)}
                placeholder="Mention usage history, thermal repasting, battery health percentage, accessories..."
                rows="3"
                className="create-listing-control"
              />
            </div>

            <div className="create-listing-field-grid create-listing-field-grid--two">
              <div>
                <label className="create-listing-label">Device Age</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 1.5 years"
                  className="create-listing-control create-listing-control--compact"
                />
              </div>

              <div>
                <label className="create-listing-label">Warranty Status</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. 6 months remaining / Expired"
                  className="create-listing-control create-listing-control--compact"
                />
              </div>
            </div>

            <div className="create-listing-toggles">
              <label className="create-listing-toggle">
                <input
                  type="checkbox"
                  checked={hasBill}
                  onChange={(e) => setHasBill(e.target.checked)}
                  className="create-listing-checkbox"
                />
                <span>Invoice / Bill Available</span>
              </label>

              <label className="create-listing-toggle">
                <input
                  type="checkbox"
                  checked={hasBox}
                  onChange={(e) => setHasBox(e.target.checked)}
                  className="create-listing-checkbox"
                />
                <span>Original Packaging / Box</span>
              </label>
            </div>

            {/* Device Health & Diagnostic Certification (Prompt 1) */}
            <div className="create-health-section" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck style={{ color: '#10b981' }} size={20} />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Device Health & Diagnostic Certification
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Accurate diagnostics generate a higher <strong>Health Score (0–100)</strong>, increasing buyer trust and sale speed.
              </p>

              {/* Dynamic inputs based on category */}
              {['mobiles', 'phones', 'tablets', 'laptops', 'macbooks'].some(k => category.toLowerCase().includes(k)) ? (
                <>
                  <div className="create-listing-field-grid create-listing-field-grid--two">
                    <div>
                      <label className="create-listing-label">Battery Health (%) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={deviceHealth.batteryHealthPercent}
                        onChange={(e) => setDeviceHealth({ ...deviceHealth, batteryHealthPercent: Number(e.target.value) })}
                        placeholder="e.g. 94"
                        className="create-listing-control create-listing-control--compact"
                      />
                    </div>
                    <div>
                      <label className="create-listing-label">Battery Cycle Count</label>
                      <input
                        type="number"
                        min="0"
                        value={deviceHealth.cycleCount}
                        onChange={(e) => setDeviceHealth({ ...deviceHealth, cycleCount: Number(e.target.value) })}
                        placeholder="e.g. 180"
                        className="create-listing-control create-listing-control--compact"
                      />
                    </div>
                  </div>

                  <div className="create-listing-toggles" style={{ marginTop: '0.75rem' }}>
                    <label className="create-listing-toggle">
                      <input
                        type="checkbox"
                        checked={deviceHealth.touchWorks}
                        onChange={(e) => setDeviceHealth({ ...deviceHealth, touchWorks: e.target.checked })}
                        className="create-listing-checkbox"
                      />
                      <span>Display Touch & Digitizer 100% Responsive</span>
                    </label>
                    <label className="create-listing-toggle">
                      <input
                        type="checkbox"
                        checked={!deviceHealth.deadPixels}
                        onChange={(e) => setDeviceHealth({ ...deviceHealth, deadPixels: !e.target.checked })}
                        className="create-listing-checkbox"
                      />
                      <span>Zero Dead Pixels or Display Lines</span>
                    </label>
                    <label className="create-listing-toggle">
                      <input
                        type="checkbox"
                        checked={deviceHealth.chargesProperly}
                        onChange={(e) => setDeviceHealth({ ...deviceHealth, chargesProperly: e.target.checked })}
                        className="create-listing-checkbox"
                      />
                      <span>Charges Properly via Port</span>
                    </label>
                  </div>
                </>
              ) : (
                /* GPU / Component Diagnostics */
                <div className="create-listing-field-grid create-listing-field-grid--two">
                  <div>
                    <label className="create-listing-label">Storage / Drive SMART Health</label>
                    <select
                      value={deviceHealth.smartStatus}
                      onChange={(e) => setDeviceHealth({ ...deviceHealth, smartStatus: e.target.value })}
                      className="create-listing-control"
                    >
                      <option value="healthy">Healthy (100% SMART Passed)</option>
                      <option value="warning">Warning (Caution / Reallocated sectors)</option>
                      <option value="failing">Failing / Critical</option>
                      <option value="untested">Untested</option>
                    </select>
                  </div>
                  <div>
                    <label className="create-listing-label">Display Ports Tested</label>
                    <input
                      type="text"
                      readOnly
                      value="HDMI, DisplayPort, Type-C Output Functional"
                      className="create-listing-control create-listing-control--compact"
                      style={{ opacity: 0.8 }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="create-listing-step__actions">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="create-listing-button create-listing-button--secondary"
              >
                <ArrowLeft className="create-listing-icon create-listing-icon--small" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="create-listing-button create-listing-button--dark"
              >
                <span>Continue to Photos & Price</span>
                <ArrowRight className="create-listing-icon create-listing-icon--small" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photos & Price */}
        {currentStep === 3 && (
          <div className="create-listing-step">
            <h2 className="create-listing-step__title">Step 3: Pricing & Photos</h2>

            <div className="create-listing-field-grid">
              <div>
                <label className="create-listing-label">Asking Price (₹ INR) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 38500"
                  required
                  className="create-listing-control create-listing-control--price"
                />
              </div>

              <div>
                <label className="create-listing-label">Original Retail Price (₹ INR)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 71000"
                  className="create-listing-control"
                />
              </div>
            </div>

            <div>
              <label className="create-listing-label">Location / City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore, Indiranagar"
                className="create-listing-control"
              />
            </div>

            <div>
              <label className="create-listing-label">Upload Photos (Min 1, Max 6)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="create-listing-photo-grid">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="create-listing-photo">
                    <img src={img} alt="Preview" className="create-listing-photo__image" />
                    {idx === 0 && (
                      <span className="create-listing-photo__cover">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="create-listing-photo__remove"
                    >
                      <Trash2 className="create-listing-icon create-listing-icon--tiny" />
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="create-listing-photo__add"
                  >
                    <Upload className="create-listing-icon create-listing-icon--medium" />
                    <span>Upload Device Photos</span>
                  </button>
                )}
              </div>
            </div>

            <div className="create-listing-step__actions">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="create-listing-button create-listing-button--secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="create-listing-button create-listing-button--dark"
              >
                <span>Continue to Data Wipe Guide</span>
                <ArrowRight className="create-listing-icon create-listing-icon--small" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Mandatory Data-Wipe Checklist (PRD 4.1 #15) */}
        {currentStep === 4 && (
          <div className="create-listing-step">
            <div className="create-listing-wipe-notice">
              <ShieldCheck className="create-listing-icon create-listing-icon--large" />
              <div>
                <h3 className="create-listing-wipe-notice__title">
                  Mandatory Data-Wipe & Privacy Checklist
                </h3>
                <p className="create-listing-wipe-notice__copy">
                  Before any device can be published on ReTech, sellers must certify that all sensitive user data, payment tokens, and cloud accounts are wiped cleanly.
                </p>
              </div>
            </div>

            <div className="create-listing-wipe-list">
              <label
                onClick={() => setWipeChecklist({ ...wipeChecklist, signOutAccounts: !wipeChecklist.signOutAccounts })}
                className={`create-listing-wipe-item ${wipeChecklist.signOutAccounts ? 'is-complete' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={wipeChecklist.signOutAccounts}
                  onChange={() => {}}
                  className="create-listing-checkbox"
                />
                <div>
                  <h4 className="create-listing-wipe-item__title">Signed out of Apple ID / Google / Microsoft accounts</h4>
                  <p className="create-listing-wipe-item__copy">Ensure iCloud Activation Lock or Google FRP is fully disengaged.</p>
                </div>
              </label>

              <label
                onClick={() => setWipeChecklist({ ...wipeChecklist, removePasscode: !wipeChecklist.removePasscode })}
                className={`create-listing-wipe-item ${wipeChecklist.removePasscode ? 'is-complete' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={wipeChecklist.removePasscode}
                  onChange={() => {}}
                  className="create-listing-checkbox"
                />
                <div>
                  <h4 className="create-listing-wipe-item__title">Screen passcodes and biometric locks removed</h4>
                  <p className="create-listing-wipe-item__copy">Remove PINs so the buyer or repair technician can power on and verify.</p>
                </div>
              </label>

              <label
                onClick={() => setWipeChecklist({ ...wipeChecklist, factoryReset: !wipeChecklist.factoryReset })}
                className={`create-listing-wipe-item ${wipeChecklist.factoryReset ? 'is-complete' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={wipeChecklist.factoryReset}
                  onChange={() => {}}
                  className="create-listing-checkbox"
                />
                <div>
                  <h4 className="create-listing-wipe-item__title">Cryptographic hardware factory reset performed</h4>
                  <p className="create-listing-wipe-item__copy">Full erase of user partition with key destruction.</p>
                </div>
              </label>

              <label
                onClick={() => setWipeChecklist({ ...wipeChecklist, removeSimSd: !wipeChecklist.removeSimSd })}
                className={`create-listing-wipe-item ${wipeChecklist.removeSimSd ? 'is-complete' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={wipeChecklist.removeSimSd}
                  onChange={() => {}}
                  className="create-listing-checkbox"
                />
                <div>
                  <h4 className="create-listing-wipe-item__title">Physical SIM cards and MicroSD memory cards ejected</h4>
                  <p className="create-listing-wipe-item__copy">Ensure no physical storage media remains in trays or slots.</p>
                </div>
              </label>
            </div>

            <div className="create-listing-step__actions">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="create-listing-button create-listing-button--secondary"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!allWiped}
                onClick={() => setCurrentStep(5)}
                className={`create-listing-button ${allWiped ? 'create-listing-button--primary' : 'create-listing-button--disabled'}`}
              >
                <span>Confirm Wipe & Review</span>
                <ArrowRight className="create-listing-icon create-listing-icon--small" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmit} className="create-listing-step">
            <h2 className="create-listing-step__title">Step 5: Review Environmental Impact & Publish</h2>

            {/* Calculated Impact Card */}
            <div className="create-listing-impact">
              <div className="create-listing-impact__eyebrow">
                <Leaf className="create-listing-icon create-listing-icon--small" />
                <span>Estimated Circular Contribution</span>
              </div>
              <h3 className="create-listing-impact__title">
                This listing will keep ~{estimatedImpactKg} kg of e-waste in circulation!
              </h3>
              <p className="create-listing-impact__copy">
                Saving an estimated <strong>{estimatedCo2Saved} kg of CO2 equivalent</strong> compared to the manufacture of a replacement unit.
              </p>
            </div>

            {/* Summary preview */}
            <div className="create-listing-review">
              <div className="create-listing-review__row">
                <span className="create-listing-review__label">Item</span>
                <span className="create-listing-review__value">{title || `${brand} ${model}`}</span>
              </div>
              <div className="create-listing-review__row">
                <span className="create-listing-review__label">Price</span>
                <span className="create-listing-review__value create-listing-review__value--eco">₹{Number(price).toLocaleString()}</span>
              </div>
              <div className="create-listing-review__row">
                <span className="create-listing-review__label">Condition</span>
                <span className="create-listing-review__value">{CONDITION_GRADES[condition]?.label}</span>
              </div>
              <div className="create-listing-review__row">
                <span className="create-listing-review__label">Data Wipe Verified</span>
                <span className="create-listing-review__value create-listing-review__value--verified">✓ All 4 Checks Passed</span>
              </div>
            </div>

            <div className="create-listing-step__actions">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="create-listing-button create-listing-button--secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="create-listing-button create-listing-button--primary create-listing-button--publish"
              >
                <Sparkles className="create-listing-icon create-listing-icon--small" />
                <span>{isSubmitting ? 'Uploading & Creating Listing...' : 'Publish Listing Now'}</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
