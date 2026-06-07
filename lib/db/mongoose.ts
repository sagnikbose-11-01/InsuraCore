// ============================================================
// lib/db/mongoose.ts
// Mongoose connection with Next.js-compatible caching.
// In serverless/Next.js, each request can create a new module
// instance. We cache the connection on the global object to
// prevent exhausting MongoDB connection limits.
// ============================================================

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Extend the global type so TypeScript knows about our cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function healDatabase() {
  try {
    // Dynamically import models to register them
    await import('../../models/Policy');
    await import('../../models/PurchasedPolicy');
    await import('../../models/Claim');
    await import('../../models/ClaimAuditLog');

    const Policy = mongoose.models.Policy || mongoose.model('Policy');
    const PurchasedPolicy = mongoose.models.PurchasedPolicy || mongoose.model('PurchasedPolicy');
    const Claim = mongoose.models.Claim || mongoose.model('Claim');
    const ClaimAuditLog = mongoose.models.ClaimAuditLog || mongoose.model('ClaimAuditLog');

    // 1. Heal policyType
    const claims = await Claim.find({ policyType: { $exists: false } });
    if (claims.length > 0) {
      console.log(`[Self-Heal] Found ${claims.length} claims with missing policyType.`);
      for (const claim of claims) {
        const purchasedPolicy = await PurchasedPolicy.findById(claim.purchasedPolicyId);
        if (purchasedPolicy) {
          const policy = await Policy.findById(purchasedPolicy.policyId);
          if (policy) {
            await Claim.updateOne(
              { _id: claim._id },
              { $set: { policyType: policy.type } }
            );
            console.log(`[Self-Heal] Set policyType to ${policy.type} for claim ${claim._id}`);
          }
        }
      }
    }

    // 2. Heal priority
    await Claim.updateMany(
      { priority: { $exists: false } },
      { $set: { priority: 'MEDIUM' } }
    );

    // 3. Heal riskScore
    await Claim.updateMany(
      { riskScore: { $exists: false } },
      { $set: { riskScore: 0 } }
    );

    // 4. Heal fraudFlags
    await Claim.updateMany(
      { fraudFlags: { $exists: false } },
      { $set: { fraudFlags: [] } }
    );

    console.log('[Self-Heal] Database healing routine completed successfully.');
  } catch (err) {
    console.error('[Self-Heal] Error healing database:', err);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no pending connection, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (m) => {
      console.log('✅ MongoDB connected');
      // Run database self-healing asynchronously
      healDatabase();
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
