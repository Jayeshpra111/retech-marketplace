// server/tests/healthScore.test.js
const { calculateHealthScore } = require('../src/services/healthScore.service');

describe('Health Score Engine Unit Tests', () => {
  test('Smartphone in pristine condition scores 95-100', () => {
    const perfectPhone = {
      battery: { healthPercent: 98, cycleCount: 120, chargesProperly: true },
      screen: { deadPixels: false, burnIn: false, touchWorks: true, scratches: 'none' },
      storage: { smartStatus: 'healthy', sizeGB: 256 },
      ports: [{ name: 'USB-C', works: true }],
      camera: true,
      speakers: true,
      wifiBluetooth: true,
    };
    const score = calculateHealthScore(perfectPhone, 'phone');
    expect(score).toBeGreaterThanOrEqual(95);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('Smartphone with broken touch, cracked screen, degraded battery scores low (<50)', () => {
    const badPhone = {
      battery: { healthPercent: 62, cycleCount: 1400, chargesProperly: false },
      screen: { deadPixels: true, burnIn: true, touchWorks: false, scratches: 'cracked' },
      storage: { smartStatus: 'failing', sizeGB: 64 },
      ports: [{ name: 'USB-C', works: false }],
      camera: false,
      speakers: false,
      wifiBluetooth: false,
    };
    const score = calculateHealthScore(badPhone, 'phone');
    expect(score).toBeLessThan(50);
  });

  test('GPU with all display ports working and healthy SMART scores high (>=90)', () => {
    const gpuData = {
      storage: { smartStatus: 'healthy' },
      ports: [
        { name: 'HDMI 2.1', works: true },
        { name: 'DisplayPort 1.4a', works: true },
        { name: 'DisplayPort 1.4a #2', works: true },
      ],
      wifiBluetooth: true,
      speakers: true,
    };
    const score = calculateHealthScore(gpuData, 'gpu');
    expect(score).toBeGreaterThanOrEqual(90);
  });
});
