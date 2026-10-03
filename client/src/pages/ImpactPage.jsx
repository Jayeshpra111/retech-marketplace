import React, { useState } from 'react';
import { Leaf, BookOpen } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import '../styles/pages.css';

export default function ImpactPage() {
  const [calcCategory, setCalcCategory] = useState('laptops');
  const [calcQuantity, setCalcQuantity] = useState(2);

  const selectedCat = CATEGORIES.find(c => c.id === calcCategory);
  const totalWeight = Number(((selectedCat?.impactMultiplier || 1) * calcQuantity).toFixed(2));
  const totalCo2 = Math.round(totalWeight * 68);

  return (
    <div className="impact-page">
      
      {/* Hero Header */}
      <div className="impact-hero">
        <span className="impact-hero__badge">
          <Leaf className="impact-icon impact-icon--badge" />
          Transparent Science-Backed Metrics
        </span>
        <h1 className="impact-hero__title">
          How ReTech Measures Circular Environmental Impact
        </h1>
        <p className="impact-hero__summary">
          Every figure displayed in ReTech Market — including kilograms of diverted e-waste and CO2 emissions prevented — is derived from standardized life cycle assessments (LCA) and the United Nations Global E-waste Monitor.
        </p>
      </div>

      {/* Interactive Impact Calculator Simulator */}
      <div className="impact-calculator">
        <div>
          <span className="impact-calculator__eyebrow">
            Interactive Calculator
          </span>
          <h2 className="impact-calculator__title">
            Simulate Your Environmental Contribution
          </h2>
          <p className="impact-calculator__summary">
            See the exact e-waste diverted and embodied emissions spared when recirculating hardware:
          </p>
        </div>

        <div className="impact-calculator__fields">
          <div>
            <label className="impact-calculator__label">Category</label>
            <select
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
              className="impact-calculator__control"
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="impact-calculator__label">Units Recirculated</label>
            <input
              type="number"
              min="1"
              max="50"
              value={calcQuantity}
              onChange={(e) => setCalcQuantity(Number(e.target.value))}
              className="impact-calculator__control"
            />
          </div>
        </div>

        <div className="impact-calculator__results">
          <div className="impact-metric impact-metric--waste">
            <span className="impact-metric__label">
              Estimated E-Waste Diverted
            </span>
            <span className="impact-metric__value">~{totalWeight} kg</span>
            <p className="impact-metric__detail">
              Toxic lead, cadmium, and cobalt prevented from municipal landfill leachate.
            </p>
          </div>

          <div className="impact-metric impact-metric--carbon">
            <span className="impact-metric__label">
              Avoided Embodied Emissions
            </span>
            <span className="impact-metric__value">~{totalCo2} kg CO2e</span>
            <p className="impact-metric__detail">
              Equivalent to driving ~{Math.round(totalCo2 * 4.2)} km in an average gasoline passenger vehicle.
            </p>
          </div>
        </div>
      </div>

      {/* Core Methodology Pillars */}
      <div className="impact-pillars">
        
        <div className="impact-pillar">
          <div className="impact-pillar__number impact-pillar__number--blue">
            1
          </div>
          <h3 className="impact-pillar__title">1. Category Weight Coefficients</h3>
          <p className="impact-pillar__description">
            Every product category is assigned a standardized physical mass constant derived from the average retail weight of items in that classification (e.g., modern laptops average 2.1 kg including thermal copper and battery packs; desktop GPUs average 1.45 kg).
          </p>
        </div>

        <div className="impact-pillar">
          <div className="impact-pillar__number impact-pillar__number--eco">
            2
          </div>
          <h3 className="impact-pillar__title">2. Embodied Carbon vs Operational Carbon</h3>
          <p className="impact-pillar__description">
            Over <strong>75% to 85% of a computer's total lifetime carbon footprint</strong> occurs during initial silicon wafer manufacturing, semiconductor lithography, and precious metal mining — <em>not</em> when the user plugs it into the wall. Extending a device's active lifespan avoids creating a replacement footprint.
          </p>
        </div>

      </div>

      {/* Published Sources & Citations Table (PRD Section 1.0) */}
      <div className="impact-sources">
        <h3 className="impact-sources__title">
          <BookOpen className="impact-icon impact-icon--source" />
          <span>Cited Published Standards & Studies</span>
        </h3>

        <div className="impact-sources__list">
          <div className="impact-source">
            <h4 className="impact-source__title">
              UN Global E-waste Monitor (2024 Edition) — UNITAR / ITU
            </h4>
            <p className="impact-source__description">
              Reports 62 million metric tonnes of electronic waste generated globally in 2022, rising towards 82M tonnes by 2030, with currently only 22.3% documented as formal collection.
            </p>
          </div>

          <div className="impact-source">
            <h4 className="impact-source__title">
              Circular Electronics Partnership (CEP) Roadmap
            </h4>
            <p className="impact-source__description">
              Guidelines for circular component reuse, secondary life verification, and component modular harvesting for repair.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
