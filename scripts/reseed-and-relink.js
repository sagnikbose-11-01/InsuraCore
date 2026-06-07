// ============================================================
// scripts/reseed-and-relink.js
// Re-seeds policy templates and re-links any PurchasedPolicy
// records whose policyId reference was broken (null after populate).
// Run: node scripts/reseed-and-relink.js
// ============================================================

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// 1. Read MONGODB_URI from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let mongodbUri = 'mongodb://127.0.0.1:27017/insuracore';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI\s*=\s*(.*)/);
  if (match && match[1]) mongodbUri = match[1].trim();
}

console.log(`Connecting to: ${mongodbUri}`);

// 2. Minimal schemas (plain JS — no TypeScript needed)
const PolicySchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  premiumAmount: Number,
  coverageAmount: Number,
  validityPeriod: Number,
  eligibility: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const PurchasedPolicySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
  startDate: Date,
  endDate: Date,
  status: String,
}, { timestamps: true });

const Policy = mongoose.models.Policy || mongoose.model('Policy', PolicySchema);
const PurchasedPolicy = mongoose.models.PurchasedPolicy || mongoose.model('PurchasedPolicy', PurchasedPolicySchema);

const policiesToSeed = [
  {
    name: 'InsuraCore Health Gold',
    type: 'HEALTH',
    description: 'Comprehensive health coverage including hospitalization, outpatient care, ICU charges, and annual health checkups. Perfect for families looking for top-tier health protection.',
    premiumAmount: 850,
    coverageAmount: 500000,
    validityPeriod: 12,
    eligibility: ['Age between 18 and 65', 'Pre-existing diseases covered after 2 years waiting period'],
    isActive: true,
  },
  {
    name: 'Smart Auto Comprehensive',
    type: 'AUTO',
    description: 'All-inclusive protection for your vehicle, covering accidental damage, third-party liability, theft, road-side assistance, and zero-depreciation coverage options.',
    premiumAmount: 450,
    coverageAmount: 300000,
    validityPeriod: 12,
    eligibility: ['Valid driver license', 'Vehicle registered in India', 'Vehicle age under 15 years'],
    isActive: true,
  },
  {
    name: 'Home Shield Property Plan',
    type: 'PROPERTY',
    description: 'Protect your home structure and contents against natural calamities, fire, burglary, structural breakdown, and electrical accidents. Includes alternative accommodation coverage.',
    premiumAmount: 1200,
    coverageAmount: 2500000,
    validityPeriod: 24,
    eligibility: ['Residential properties only', 'Owner or leaseholder of the property'],
    isActive: true,
  },
  {
    name: 'Term Life Secure',
    type: 'LIFE',
    description: "High-coverage life protection plan ensuring your family's financial security in your absence. Includes terminal illness benefits and flexible premium frequencies.",
    premiumAmount: 1500,
    coverageAmount: 10000000,
    validityPeriod: 120,
    eligibility: ['Age 18 to 60 years', 'Non-smokers preferred (higher limits)'],
    isActive: true,
  },
  {
    name: 'GlobeTrotter Travel Plus',
    type: 'TRAVEL',
    description: 'International travel cover for baggage loss, trip delays, emergency medical expenses, and passport loss. Protects your global vacations from unexpected hiccups.',
    premiumAmount: 180,
    coverageAmount: 150000,
    validityPeriod: 3,
    eligibility: ['Age under 70 years', 'Valid passport holder'],
    isActive: true,
  },
  {
    name: 'Critical Illness Protector',
    type: 'HEALTH',
    description: 'Specialized health coverage covering critical illnesses like cancer, stroke, and cardiac procedures. Provides a lump-sum payout upon diagnostic confirmation.',
    premiumAmount: 1100,
    coverageAmount: 1500000,
    validityPeriod: 12,
    eligibility: ['Age between 18 and 60', 'No prior history of chronic cardiovascular or oncological conditions'],
    isActive: true,
  },
  {
    name: 'Business Liability Basic',
    type: 'PROPERTY',
    description: 'Commercial liability plan protecting your business premises, electronics, and office equipment against accidental fire, theft, and third-party operational claims.',
    premiumAmount: 2200,
    coverageAmount: 5000000,
    validityPeriod: 12,
    eligibility: ['Registered MSME or proprietary business', 'Commercial building structure certification'],
    isActive: true,
  },
  {
    name: 'Electric Vehicle Guard',
    type: 'AUTO',
    description: 'Dedicated EV insurance covering battery damages, electrical failures, public charging liabilities, and zero-depreciation claims for hybrid and battery electric cars.',
    premiumAmount: 650,
    coverageAmount: 600000,
    validityPeriod: 12,
    eligibility: ['Valid driving license', 'Registered battery electric vehicle (BEV) or PHEV', 'Vehicle age under 5 years'],
    isActive: true,
  },
  {
    name: 'Family Legacy Secure',
    type: 'LIFE',
    description: "High-tier premium term insurance providing substantial coverage to secure your family's lifestyle and legacy in the event of unexpected terminal emergencies.",
    premiumAmount: 2800,
    coverageAmount: 25000000,
    validityPeriod: 240,
    eligibility: ['Age 18 to 55 years', 'Standard diagnostic medical checkup clearance'],
    isActive: true,
  },
];

async function run() {
  try {
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected to MongoDB');

    // ── Step 1: Upsert policies (don't delete, just ensure they exist) ──
    const upsertedPolicies = [];
    for (const p of policiesToSeed) {
      // Use upsert so existing valid docs aren't duplicated
      const doc = await Policy.findOneAndUpdate(
        { name: p.name },
        { $setOnInsert: p },
        { upsert: true, new: true }
      );
      upsertedPolicies.push(doc);
    }
    console.log(`🌱 Upserted ${upsertedPolicies.length} policy templates`);

    // Build a map: policyType -> first matching seeded Policy _id
    const typeToNewPolicyId = {};
    for (const p of upsertedPolicies) {
      if (!typeToNewPolicyId[p.type]) {
        typeToNewPolicyId[p.type] = p._id;
      }
    }

    // ── Step 2: Find orphaned PurchasedPolicy records ──
    const allPurchased = await PurchasedPolicy.find({});
    let orphaned = 0;
    let relinked = 0;

    for (const pp of allPurchased) {
      // Check if the referenced policy still exists
      const exists = await Policy.exists({ _id: pp.policyId });
      if (!exists) {
        orphaned++;
        // We don't know the original type from the PurchasedPolicy alone,
        // so we'll try to find a claim that was filed against this purchased
        // policy to infer the policyType. If not, default to HEALTH.
        const ClaimSchema = new mongoose.Schema({ policyType: String, purchasedPolicyId: mongoose.Schema.Types.ObjectId });
        const Claim = mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);
        const relatedClaim = await Claim.findOne({ purchasedPolicyId: pp._id }).select('policyType');

        const inferredType = relatedClaim?.policyType || 'HEALTH';
        const newPolicyId = typeToNewPolicyId[inferredType] || upsertedPolicies[0]._id;

        await PurchasedPolicy.updateOne(
          { _id: pp._id },
          { $set: { policyId: newPolicyId } }
        );
        console.log(`  🔗 Re-linked PurchasedPolicy ${pp._id} → Policy type "${inferredType}" (${newPolicyId})`);
        relinked++;
      }
    }

    if (orphaned === 0) {
      console.log('✅ No orphaned PurchasedPolicy records found — all references are intact.');
    } else {
      console.log(`\n✅ Re-linked ${relinked}/${orphaned} orphaned PurchasedPolicy records.`);
    }

    console.log('\n🎉 Done! Refresh your dashboard to see your policies.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

run();
