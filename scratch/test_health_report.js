// scratch/test_health_report.js
async function run() {
  console.log('Testing Device Health Report Flow...');

  // 1. Login user
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retechmarket.com', password: process.env.ADMIN_SEED_PASSWORD || 'Admin@1234' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  console.log('Admin login status:', loginRes.status, 'token received:', !!token);

  // 2. Get a listing
  const listRes = await fetch('http://localhost:5000/api/v1/listings?limit=1');
  const listData = await listRes.json();
  const listing = listData.data && listData.data[0];
  if (!listing) {
    console.log('No listings found to test with.');
    return;
  }
  const listingId = listing._id || listing.id;
  console.log('Using listing:', listing.title, `(${listingId})`);

  // 3. Create / Attach Health Report
  const reportPayload = {
    deviceType: 'laptop',
    battery: {
      healthPercent: 91,
      cycleCount: 210,
      chargesProperly: true,
    },
    screen: {
      touchWorks: true,
      deadPixels: false,
      burnIn: false,
      scratches: 'none',
    },
    storage: {
      sizeGB: 512,
      smartStatus: 'healthy',
    },
    ports: [
      { name: 'Thunderbolt 4 #1', works: true },
      { name: 'Thunderbolt 4 #2', works: true },
      { name: 'MagSafe 3', works: true },
    ],
    camera: true,
    speakers: true,
    wifiBluetooth: true,
    notes: 'Diagnostic passed with CoconutBattery and Apple Diagnostics (no issues found).',
  };

  const createRes = await fetch(`http://localhost:5000/api/v1/listings/${listingId}/health-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reportPayload),
  });
  const createData = await createRes.json();
  console.log('Create report status:', createRes.status);
  console.log('Report healthScore computed:', createData.data?.healthScore);

  // 4. Read report publicly
  const getRes = await fetch(`http://localhost:5000/api/v1/listings/${listingId}/health-report`);
  const getData = await getRes.json();
  console.log('Public GET status:', getRes.status, 'Score:', getData.data?.healthScore);

  // 5. Admin verify
  const verifyRes = await fetch(`http://localhost:5000/api/v1/listings/${listingId}/health-report/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isVerified: true }),
  });
  const verifyData = await verifyRes.json();
  console.log('Admin verify status:', verifyRes.status, 'isVerified:', verifyData.data?.isVerified);
}

run().catch(console.error);
