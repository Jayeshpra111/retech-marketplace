import React, { useState } from 'react';
import { 
  Recycle, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Search, 
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import '../styles/pages.css';

export default function RecyclerDirectoryPage() {
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [recyclers, setRecyclers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    api.recyclers
      .getAll()
      .then((res) => {
        if (res?.data) {
          setRecyclers(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRecyclers = recyclers.filter((r) => {
    const centerCity = r.address?.city || r.city || '';
    if (selectedCity !== 'all' && !centerCity.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return r.name?.toLowerCase().includes(q) || (r.acceptedItems || []).some((i) => i.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="recycler-page">
      
      {/* Header */}
      <div className="recycler-hero">
        <span className="recycler-hero__badge">
          <Recycle className="recycler-icon recycler-icon--badge" />
          Certified E-Waste Drop-Off Directory
        </span>
        <h1 className="recycler-hero__title">
          Can't Sell or Fix It? Responsibly Recycle.
        </h1>
        <p className="recycler-hero__summary">
          When electronics reach the absolute end of their usable life, they must not enter municipal landfills. Locate CPCB authorized, R2-certified facilities that extract precious metals and neutralize toxic lithium, cadmium, and lead safely.
        </p>
      </div>

      {/* Safety Notice for Swollen / Hazardous Batteries */}
      <div className="recycler-safety-notice">
        <AlertTriangle className="recycler-icon recycler-icon--warning" />
        <div className="recycler-safety-notice__copy">
          <h4 className="recycler-safety-notice__title">Hazard Notice: Bloated Lithium Batteries</h4>
          <p className="recycler-safety-notice__text">
            Never attempt to ship punctured or swollen lithium-ion battery packs via courier. Bring them directly to the drop-off centers below in fire-resistant sand or heavy-duty plastic containers.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="recycler-filters">
        <div className="recycler-search">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by facility name or accepted item (e.g. Lithium, Motherboards)..."
            className="recycler-search__input"
          />
          <Search className="recycler-search__icon" />
        </div>

        <div className="recycler-city-filter">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="recycler-city-filter__select"
          >
            <option value="all">All Metro Cities</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi NCR</option>
          </select>
        </div>
      </div>

      {/* Recyclers Grid */}
      <div className="recycler-grid">
        {filteredRecyclers.map((rec, i) => (
          <div key={rec._id || rec.id || `rec-${i}`} className="recycler-card">
            <div className="recycler-card__details">
              <div className="recycler-card__labels">
                <span className="recycler-card__city">
                  {rec.city}
                </span>
                {rec.pickupAvailable && (
                  <span className="recycler-card__pickup">
                    Doorstep Pickup Avail.
                  </span>
                )}
              </div>

              <h3 className="recycler-card__name">
                {rec.name}
              </h3>

              <div className="recycler-card__contact">
                <p className="recycler-card__contact-row">
                  <MapPin className="recycler-icon recycler-icon--contact" />
                  <span>{typeof rec.address === 'string' ? rec.address : `${rec.address?.line1 || ''}, ${rec.address?.city || ''}`}</span>
                </p>
                <p className="recycler-card__contact-row">
                  <Phone className="recycler-icon recycler-icon--contact" />
                  <span className="recycler-card__phone">{rec.phone || 'Contact on site'}</span>
                </p>
              </div>

              {/* Certifications */}
              <div className="recycler-card__certifications">
                <span className="recycler-card__section-label">
                  Verified Certifications
                </span>
                <div className="recycler-card__tags">
                  {(Array.isArray(rec.certifications) ? rec.certifications : rec.certification ? rec.certification.split(',').map((c) => c.trim()) : ['CPCB Authorized']).map((cert, i) => (
                    <span key={i} className="recycler-card__certification">
                      <ShieldCheck className="recycler-icon recycler-icon--certified" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accepted Items */}
              <div className="recycler-card__materials">
                <span className="recycler-card__section-label">
                  Accepted Materials
                </span>
                <div className="recycler-card__tags">
                  {rec.acceptedItems.map((item, idx) => (
                    <span key={idx} className="recycler-card__material">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="recycler-card__footer">
              <a
                href={`tel:${rec.phone.replace(/[^0-9+]/g, '')}`}
                className="recycler-card__call"
              >
                <Phone className="recycler-icon recycler-icon--button" />
                <span>Call Center for Drop-off</span>
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
