// server/src/services/healthScore.service.js
/**
 * ReTech Market - Device Health Score Calculation Engine
 * 
 * Computes an objective 0–100 rating based on component diagnostic answers.
 * Dynamically adjusts component weighting according to device architecture:
 * 
 * Category A: Battery-powered devices with display (phone, laptop, tablet)
 *   - Battery Health: 25%
 *   - Display / Screen: 25%
 *   - Storage & SMART: 25%
 *   - Ports, Audio & Connectivity: 25%
 * 
 * Category B: Hardware Components (GPU, desktop, components, other)
 *   - Storage / Core Circuitry: 40%
 *   - Ports & Display Interfaces: 35%
 *   - Connectivity & Functional Accessories: 25%
 */

function calculateHealthScore(reportData, deviceType = 'other') {
  const isBatteryDisplayDevice = ['phone', 'laptop', 'tablet'].includes(deviceType);

  if (isBatteryDisplayDevice) {
    return calculateBatteryDeviceScore(reportData);
  }

  return calculateComponentScore(reportData);
}

function calculateBatteryDeviceScore(data) {
  let batteryPoints = 25;
  const battery = data.battery || {};

  if (battery.healthPercent !== null && battery.healthPercent !== undefined) {
    const hp = Math.max(0, Math.min(100, Number(battery.healthPercent)));
    batteryPoints = (hp / 100) * 20;

    // Cycle count modifier (5 points)
    const cycles = Number(battery.cycleCount) || 0;
    if (cycles <= 300) batteryPoints += 5;
    else if (cycles <= 600) batteryPoints += 3.5;
    else if (cycles <= 1000) batteryPoints += 2;
    else batteryPoints += 0.5;
  } else {
    // If not reported, assume default baseline
    batteryPoints = 20;
  }

  if (battery.chargesProperly === false) {
    batteryPoints = Math.max(0, batteryPoints - 15);
  }

  // 2. Display / Screen (25 pts)
  let screenPoints = 25;
  const screen = data.screen || {};

  if (screen.touchWorks === false) screenPoints -= 15;
  if (screen.deadPixels === true) screenPoints -= 8;
  if (screen.burnIn === true) screenPoints -= 8;

  switch (screen.scratches) {
    case 'cracked':
      screenPoints -= 15;
      break;
    case 'visible':
      screenPoints -= 5;
      break;
    case 'micro':
      screenPoints -= 2;
      break;
    default:
      break;
  }
  screenPoints = Math.max(0, screenPoints);

  // 3. Storage & SMART (25 pts)
  let storagePoints = 25;
  const storage = data.storage || {};
  switch (storage.smartStatus) {
    case 'healthy':
      storagePoints = 25;
      break;
    case 'warning':
      storagePoints = 12;
      break;
    case 'failing':
      storagePoints = 3;
      break;
    case 'untested':
    default:
      storagePoints = 18;
      break;
  }

  // 4. Ports & Peripherals (25 pts)
  let peripheralPoints = 25;
  const ports = Array.isArray(data.ports) ? data.ports : [];
  if (ports.length > 0) {
    const workingPorts = ports.filter((p) => p.works !== false).length;
    const portRatio = workingPorts / ports.length;
    peripheralPoints = 10 * portRatio;
  } else {
    peripheralPoints = 10;
  }

  if (data.wifiBluetooth !== false) peripheralPoints += 5;
  if (data.speakers !== false) peripheralPoints += 5;
  if (data.camera !== false) peripheralPoints += 5;

  const total = Math.round(batteryPoints + screenPoints + storagePoints + peripheralPoints);
  return Math.min(100, Math.max(0, total));
}

function calculateComponentScore(data) {
  // 1. Storage & Core Silicon (40 pts)
  let corePoints = 40;
  const storage = data.storage || {};
  switch (storage.smartStatus) {
    case 'healthy':
      corePoints = 40;
      break;
    case 'warning':
      corePoints = 20;
      break;
    case 'failing':
      corePoints = 5;
      break;
    case 'untested':
    default:
      corePoints = 30;
      break;
  }

  // 2. Ports & Interfaces (35 pts)
  let portPoints = 35;
  const ports = Array.isArray(data.ports) ? data.ports : [];
  if (ports.length > 0) {
    const workingPorts = ports.filter((p) => p.works !== false).length;
    portPoints = Math.round((workingPorts / ports.length) * 35);
  }

  // 3. Connectivity & Function (25 pts)
  let extraPoints = 0;
  if (data.wifiBluetooth !== false) extraPoints += 15;
  if (data.speakers !== false || data.camera !== false) extraPoints += 10;

  const total = Math.round(corePoints + portPoints + extraPoints);
  return Math.min(100, Math.max(0, total));
}

module.exports = { calculateHealthScore };
