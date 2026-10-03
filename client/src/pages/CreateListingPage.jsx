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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CONDITION_GRADES } from '../data/mockData';
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

  // For Parts breakdown
  const [whatWorks, setWhatWorks] = useState('');
  const [whatBroken, setWhatBroken] = useState('');

  // Photos
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
  ]);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  // Data Wipe Checklist (Must all be checked)
  const [wipeChecklist, setWipeChecklist] = useState({
    signOutAccounts: false,
    removePasscode: false,
    factoryReset: false,
    removeSimSd: false,
  });

  const allWiped = Object.values(wipeChecklist).every(Boolean);

  // Calculate environmental diversion
  const catObj = CATEGORIES.find(c => c.id === category);
  const estimatedImpactKg = catObj?.impactMultiplier ? Number((catObj.impactMultiplier * (condition === 'for_parts' ? 0.7 : 1.0)).toFixed(2)) : 0.8;
  const estimatedCo2Saved = Math.round(estimatedImpactKg * 65);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newListing = {
      id: `listing-${Date.now()}`,
      title: title || `${brand} ${model}`,
      category,
      price: Number(price) || 25000,
      originalPrice: Number(originalPrice) || Number(price) * 1.5,
      condition,
      conditionDetails: conditionDetails || 'Accurately described, functional and tested.',
      whatWorks: condition === 'for_parts' ? whatWorks : null,
      whatBroken: condition === 'for_parts' ? whatBroken : null,
      brand: brand || 'Generic',
      model: model || 'Device',
      age,
      warranty,
      hasBill,
      hasBox,
      accessories: ['Original Charger'],
      city,
      seller: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        rating: 5.0,
        reviewCount: 1,
        verified: true,
        memberSince: 'Sept 2026',
        responseTime: '< 10 mins'
      },
      images,
      impactKg: estimatedImpactKg,
      co2SavedKg: estimatedCo2Saved,
      specs: {
        'Brand': brand,
        'Model': model,
      },
      isNegotiable: true,
      views: 1,
      createdAt: 'Just now'
    };

    addListing(newListing);
    navigate(`/listings/${newListing.id}`);
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
                    {c.name} {c.isComponent ? '— (Hardware Component)' : ''}
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
              <label className="create-listing-label">Upload Photos (Min 2, Max 6)</label>
              <div className="create-listing-photo-grid">
                {images.map((img, idx) => (
                  <div key={idx} className="create-listing-photo">
                    <img src={img} alt="Preview" className="create-listing-photo__image" />
                    {idx === 0 && (
                      <span className="create-listing-photo__cover">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="create-listing-photo__remove"
                    >
                      <Trash2 className="create-listing-icon create-listing-icon--tiny" />
                    </button>
                  </div>
                ))}

                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      setImages([...images, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80']);
                    }}
                    className="create-listing-photo__add"
                  >
                    <Upload className="create-listing-icon create-listing-icon--medium" />
                    <span>Add Photo</span>
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
                className="create-listing-button create-listing-button--primary create-listing-button--publish"
              >
                <Sparkles className="create-listing-icon create-listing-icon--small" />
                <span>Publish Listing Now</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
