import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Trash2, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { CONDITION_GRADES } from '../data/mockData';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/components.css';

export default function EditListingModal({ isOpen, onClose, listing, onUpdated }) {
  if (!isOpen || !listing) return null;

  const listingId = listing._id || listing.id;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: listing.title || '',
    price: listing.price || '',
    condition: listing.condition || 'good',
    category: typeof listing.category === 'object' && listing.category !== null
      ? (listing.category._id || listing.category.slug || '')
      : (listing.category || ''),
    brand: listing.brand || '',
    model: listing.model || '',
    city: listing.city || listing.location?.city || '',
    state: listing.state || listing.location?.state || '',
    description: listing.description || '',
    warrantyLeftMonths: listing.warrantyLeftMonths || 0,
    hasBill: Boolean(listing.hasBill),
    negotiable: Boolean(listing.negotiable || listing.isNegotiable),
  });

  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active categories on mount
  useEffect(() => {
    api.listings.getCategories()
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Update local form state when listing prop changes
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        price: listing.price || '',
        condition: listing.condition || 'good',
        category: typeof listing.category === 'object' && listing.category !== null
          ? (listing.category._id || listing.category.slug || '')
          : (listing.category || ''),
        brand: listing.brand || '',
        model: listing.model || '',
        city: listing.city || listing.location?.city || '',
        state: listing.state || listing.location?.state || '',
        description: listing.description || '',
        warrantyLeftMonths: listing.warrantyLeftMonths || 0,
        hasBill: Boolean(listing.hasBill),
        negotiable: Boolean(listing.negotiable || listing.isNegotiable),
      });
      setNewImages([]);
      setNewImagePreviews([]);
    }
  }, [listing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length + newImages.length > 6) {
      toast.error('Maximum 6 additional images allowed.');
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.title.trim().length < 2) {
      toast.error('Title must be at least 2 characters.');
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    if (!formData.description || formData.description.trim().length < 5) {
      toast.error('Description must be at least 5 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      let updatePayload;

      if (newImages.length > 0) {
        const bodyFormData = new FormData();
        bodyFormData.append('title', formData.title.trim());
        bodyFormData.append('price', Number(formData.price));
        bodyFormData.append('condition', formData.condition);
        if (formData.category) bodyFormData.append('category', formData.category);
        bodyFormData.append('brand', formData.brand || '');
        bodyFormData.append('model', formData.model || '');
        bodyFormData.append('city', formData.city || '');
        bodyFormData.append('state', formData.state || '');
        bodyFormData.append('description', formData.description.trim());
        bodyFormData.append('warrantyLeftMonths', Number(formData.warrantyLeftMonths) || 0);
        bodyFormData.append('hasBill', formData.hasBill);
        bodyFormData.append('negotiable', formData.negotiable);

        newImages.forEach((img) => {
          bodyFormData.append('images', img);
        });

        updatePayload = bodyFormData;
      } else {
        updatePayload = {
          title: formData.title.trim(),
          price: Number(formData.price),
          condition: formData.condition,
          category: formData.category || undefined,
          brand: formData.brand || '',
          model: formData.model || '',
          city: formData.city || '',
          state: formData.state || '',
          description: formData.description.trim(),
          warrantyLeftMonths: Number(formData.warrantyLeftMonths) || 0,
          hasBill: formData.hasBill,
          negotiable: formData.negotiable,
        };
      }

      const res = await api.listings.update(listingId, updatePayload);
      const updatedListing = res?.data || { ...listing, ...formData };

      toast.success('Listing updated successfully!');
      if (onUpdated) {
        onUpdated(updatedListing);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingImages = listing.images || [];

  return (
    <div className="edit-listing-overlay" onClick={onClose}>
      <div className="edit-listing-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-listing-dialog__header">
          <div>
            <h2 className="edit-listing-dialog__title">Edit Listing</h2>
            <p className="edit-listing-dialog__subtitle">
              Modify details for "{listing.title}"
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="edit-listing-dialog__close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-listing-form">
          <div className="edit-listing-form__scrollable">
            {/* Title */}
            <div className="edit-form-group">
              <label className="edit-form-label">
                Listing Title <span className="edit-form-required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Memory Card 128GB High Speed"
                className="edit-form-input"
                required
                maxLength={120}
              />
            </div>

            {/* Price & Condition */}
            <div className="edit-form-row">
              <div className="edit-form-group">
                <label className="edit-form-label">
                  Selling Price (₹) <span className="edit-form-required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="500"
                  className="edit-form-input"
                  min="1"
                  required
                />
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">
                  Condition <span className="edit-form-required">*</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="edit-form-select"
                  required
                >
                  {Object.entries(CONDITION_GRADES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label} ({info.description?.substring(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Brand */}
            <div className="edit-form-row">
              <div className="edit-form-group">
                <label className="edit-form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="edit-form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.slug} value={cat._id || cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. SanDisk, Samsung"
                  className="edit-form-input"
                />
              </div>
            </div>

            {/* Model & City */}
            <div className="edit-form-row">
              <div className="edit-form-group">
                <label className="edit-form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Ultra EVO Plus"
                  className="edit-form-input"
                />
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">City / Location</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Bangalore"
                  className="edit-form-input"
                />
              </div>
            </div>

            {/* Description */}
            <div className="edit-form-group">
              <label className="edit-form-label">
                Description <span className="edit-form-required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe condition, usage history, and accessories included..."
                className="edit-form-textarea"
                required
                maxLength={3000}
              />
            </div>

            {/* Checkboxes & Extra Options */}
            <div className="edit-form-checkboxes">
              <label className="edit-form-checkbox-label">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable}
                  onChange={handleChange}
                  className="edit-form-checkbox"
                />
                <span>Price is Negotiable</span>
              </label>

              <label className="edit-form-checkbox-label">
                <input
                  type="checkbox"
                  name="hasBill"
                  checked={formData.hasBill}
                  onChange={handleChange}
                  className="edit-form-checkbox"
                />
                <span>Has Original Purchase Bill / Invoice</span>
              </label>
            </div>

            {/* Images Section */}
            <div className="edit-form-group">
              <label className="edit-form-label">Current & Additional Images</label>
              <div className="edit-listing-images">
                {/* Existing Images */}
                {existingImages.map((img, idx) => {
                  const url = typeof img === 'string' ? img : img.url;
                  return (
                    <div key={`existing-${idx}`} className="edit-listing-thumb">
                      <img src={url} alt={`Listing ${idx}`} />
                      <span className="edit-listing-thumb__tag">Current</span>
                    </div>
                  );
                })}

                {/* Newly Added Previews */}
                {newImagePreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="edit-listing-thumb">
                    <img src={preview} alt={`New upload ${idx}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="edit-listing-thumb__remove"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                    <span className="edit-listing-thumb__tag edit-listing-thumb__tag--new">New</span>
                  </div>
                ))}

                {/* Upload Button */}
                {existingImages.length + newImages.length < 6 && (
                  <label className="edit-listing-upload-btn">
                    <Upload size={20} />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="edit-listing-dialog__footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="edit-btn edit-btn--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="edit-btn edit-btn--save"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
