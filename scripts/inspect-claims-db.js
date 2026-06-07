const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '..', '..', '..', '..', '..', 'Desktop', 'Projects', 'insuracore', '.env.local');
let mongodbUri = 'mongodb://127.0.0.1:27017/insuracore';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI\s*=\s*(.*)/);
  if (match && match[1]) {
    mongodbUri = match[1].trim();
  }
}

async function run() {
  try {
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected');

    const Claim = mongoose.connection.db.collection('claims');
    const PurchasedPolicy = mongoose.connection.db.collection('purchasedpolicies');
    const Policy = mongoose.connection.db.collection('policies');

    const claims = await Claim.find({}).toArray();
    console.log('--- RAW CLAIMS IN DB ---');
    console.log(JSON.stringify(claims, null, 2));

    const purchasedPolicies = await PurchasedPolicy.find({}).toArray();
    console.log('--- RAW PURCHASED POLICIES IN DB ---');
    console.log(JSON.stringify(purchasedPolicies, null, 2));

    const policies = await Policy.find({}).toArray();
    console.log('--- RAW POLICIES IN DB ---');
    console.log(JSON.stringify(policies, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
