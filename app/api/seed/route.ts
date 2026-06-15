import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Policy from '@/models/Policy';
import { PolicyListingStatus, PolicyType } from '@/lib/constants/enums';

const DEFAULT_POLICIES = [
  // ── HEALTH POLICIES ──
  {
    name: 'Comprehensive Health Plus',
    type: PolicyType.HEALTH,
    description: 'Our most comprehensive medical protection for you and your family, covering everything from routine check-ups to major surgeries.',
    premiumAmount: 1500,
    coverageAmount: 1500000,
    validityPeriod: 12,
    eligibility: ['Age 18-65', 'Resident of India', 'No pre-existing terminal illnesses'],
    benefits: ['Hospitalisation Cover', 'Pre & Post Hospitalisation', 'Day-Care Procedures', 'Ambulance Charges'],
    exclusions: ['Cosmetic or aesthetic surgery', 'Self-inflicted injuries', 'Experimental treatments'],
    waitingPeriod: 30,
    maximumClaimAmount: 1500000,
    requiredDocuments: ['Aadhar Card', 'Medical Reports', 'Hospital Bills'],
    riskCategory: 'Standard',
    termsAndConditions: 'Standard InsuraCore Health terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Senior Citizen Health Shield',
    type: PolicyType.HEALTH,
    description: 'Specialized health coverage tailored for seniors. Includes coverage for age-related illnesses, knee replacements, and advanced diagnostics.',
    premiumAmount: 2800,
    coverageAmount: 1000000,
    validityPeriod: 12,
    eligibility: ['Age 60-80', 'Resident of India'],
    benefits: ['Pre-existing Disease Cover (after 1 year)', 'Annual Health Checkups', 'AYUSH Treatment', 'Organ Donor Cover'],
    exclusions: ['Unprescribed vitamins', 'Self-inflicted injuries'],
    waitingPeriod: 90,
    maximumClaimAmount: 1000000,
    requiredDocuments: ['Aadhar Card', 'Doctor Prescriptions', 'Discharge Summary'],
    riskCategory: 'High',
    termsAndConditions: 'Co-payment of 10% applies to all claims. Standard terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Essential Care Basic',
    type: PolicyType.HEALTH,
    description: 'An affordable, bare-bones health insurance policy designed for young professionals looking for basic hospitalization cover.',
    premiumAmount: 600,
    coverageAmount: 300000,
    validityPeriod: 12,
    eligibility: ['Age 18-35', 'Resident of India', 'No pre-existing diseases'],
    benefits: ['Accidental Hospitalization', 'Room Rent (up to ₹2000/day)', 'ICU Charges'],
    exclusions: ['Maternity expenses', 'Pre-existing diseases', 'Mental health treatment'],
    waitingPeriod: 30,
    maximumClaimAmount: 300000,
    requiredDocuments: ['Aadhar Card', 'Hospital Bills', 'Payment Receipts'],
    riskCategory: 'Low',
    termsAndConditions: 'Standard InsuraCore Basic Health terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },

  // ── AUTO POLICIES ──
  {
    name: 'Secure Auto Shield',
    type: PolicyType.AUTO,
    description: 'Full-spectrum vehicle protection on and off the road, protecting you against accidents, theft, and natural calamities.',
    premiumAmount: 850,
    coverageAmount: 500000,
    validityPeriod: 12,
    eligibility: ['Valid Driving License', 'Vehicle registered in India', 'Vehicle age < 15 years'],
    benefits: ['Own Damage Protection', 'Third-Party Liability', 'Theft Cover', 'Personal Accident Cover'],
    exclusions: ['Driving under influence', 'Driving without license', 'Mechanical breakdown'],
    waitingPeriod: 0,
    maximumClaimAmount: 500000,
    requiredDocuments: ['RC Copy', 'Driving License', 'Police FIR (in case of theft/accident)'],
    riskCategory: 'Standard',
    termsAndConditions: 'Standard InsuraCore Auto terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Zero Depreciation Auto Premium',
    type: PolicyType.AUTO,
    description: 'Premium auto insurance offering 100% claim settlement with zero depreciation on parts like plastic, glass, and fiber.',
    premiumAmount: 1400,
    coverageAmount: 800000,
    validityPeriod: 12,
    eligibility: ['Valid Driving License', 'Vehicle age < 5 years', 'No claims in the past year'],
    benefits: ['Zero Depreciation', 'Engine Protect', 'Consumables Cover', 'Roadside Assistance'],
    exclusions: ['Driving under influence', 'Intentional damage', 'Consequential damage'],
    waitingPeriod: 0,
    maximumClaimAmount: 800000,
    requiredDocuments: ['RC Copy', 'Driving License', 'Original Repair Invoices'],
    riskCategory: 'Low',
    termsAndConditions: 'Zero dep applies to max 2 claims per year.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },

  // ── PROPERTY POLICIES ──
  {
    name: 'Home Guard Property Cover',
    type: PolicyType.PROPERTY,
    description: 'Protect your home and its valuable contents against structural damage, fire, burglary, and natural disasters.',
    premiumAmount: 2200,
    coverageAmount: 5000000,
    validityPeriod: 12,
    eligibility: ['Property owner or authorized tenant', 'Residential property only'],
    benefits: ['Fire & Allied Perils', 'Theft & Burglary', 'Structural Damage', 'Temporary Accommodation'],
    exclusions: ['Wear and tear', 'Wilful destruction', 'Unoccupied for 60+ days'],
    waitingPeriod: 15,
    maximumClaimAmount: 5000000,
    requiredDocuments: ['Property Deeds', 'Photographs of damage', 'Police FIR (if theft)'],
    riskCategory: 'Standard',
    termsAndConditions: 'Standard InsuraCore Property terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Renters Content Insurance',
    type: PolicyType.PROPERTY,
    description: 'Tailored for tenants, this policy protects your furniture, electronics, and valuables without paying to insure the physical building.',
    premiumAmount: 800,
    coverageAmount: 1000000,
    validityPeriod: 12,
    eligibility: ['Active Rental Agreement', 'Residential property'],
    benefits: ['Electronic Appliances Cover', 'Jewelry & Valuables', 'Burglary Cover', 'Fire Damage to Contents'],
    exclusions: ['Structural damage to building', 'Normal wear and tear', 'Unexplained loss'],
    waitingPeriod: 15,
    maximumClaimAmount: 1000000,
    requiredDocuments: ['Rental Agreement', 'Purchase Invoices for valuables', 'Police FIR'],
    riskCategory: 'Low',
    termsAndConditions: 'Items above ₹1,000,000 must be individually declared.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },

  // ── LIFE POLICIES ──
  {
    name: 'Family Life Secure',
    type: PolicyType.LIFE,
    description: 'Secure your family\'s financial future no matter what. A long-term life insurance policy with premium benefits.',
    premiumAmount: 3500,
    coverageAmount: 10000000,
    validityPeriod: 120, // 10 years
    eligibility: ['Age 18-55', 'Employed with stable income'],
    benefits: ['Death Benefit', 'Terminal Illness Benefit', 'Tax Benefits'],
    exclusions: ['Suicide within first year', 'Participation in hazardous activities'],
    waitingPeriod: 90,
    maximumClaimAmount: 10000000,
    requiredDocuments: ['Death Certificate', 'Nominee ID Proof', 'Original Policy Document'],
    riskCategory: 'Low',
    termsAndConditions: 'Standard InsuraCore Life terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Term Plus Returns',
    type: PolicyType.LIFE,
    description: 'A term life insurance plan that offers high coverage at affordable premiums, while returning all your paid premiums upon maturity if you survive the policy term.',
    premiumAmount: 5200,
    coverageAmount: 15000000,
    validityPeriod: 240, // 20 years
    eligibility: ['Age 21-45', 'Non-smoker', 'No terminal illnesses'],
    benefits: ['Return of Premium on Maturity', 'High Death Benefit', 'Accidental Death Rider'],
    exclusions: ['Death due to pre-existing conditions within 48 months', 'Suicide within 1 year'],
    waitingPeriod: 90,
    maximumClaimAmount: 15000000,
    requiredDocuments: ['Medical Tests', 'Income Proof', 'Death Certificate (for claims)'],
    riskCategory: 'Standard',
    termsAndConditions: 'Premiums are returned only at the end of the 20-year term if no claims are made.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Child Education Endowment',
    type: PolicyType.LIFE,
    description: 'A specialized life policy designed to guarantee your child\'s higher education costs are covered, even in your absence.',
    premiumAmount: 4800,
    coverageAmount: 5000000,
    validityPeriod: 180, // 15 years
    eligibility: ['Parent age 18-50', 'Child age 0-10'],
    benefits: ['Guaranteed Maturity Benefit', 'Premium Waiver on Parent Death', 'Annual Education Payouts'],
    exclusions: ['Suicide within 1 year', 'Material non-disclosure'],
    waitingPeriod: 30,
    maximumClaimAmount: 5000000,
    requiredDocuments: ['Birth Certificate of Child', 'Parent KYC', 'Death Certificate (if applicable)'],
    riskCategory: 'Low',
    termsAndConditions: 'Payouts begin when the child reaches 18 years of age.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },

  // ── TRAVEL POLICIES ──
  {
    name: 'Global Voyager Travel',
    type: PolicyType.TRAVEL,
    description: 'Travel without worry — covered from takeoff to touchdown, including emergency medical and trip cancellation.',
    premiumAmount: 450,
    coverageAmount: 2500000,
    validityPeriod: 1, // 1 month
    eligibility: ['Valid Passport', 'Travel duration < 90 days'],
    benefits: ['Emergency Medical Abroad', 'Trip Cancellation', 'Baggage Loss & Delay', 'Passport Loss'],
    exclusions: ['Pre-existing medical conditions', 'Travel to high-risk countries'],
    waitingPeriod: 0,
    maximumClaimAmount: 2500000,
    requiredDocuments: ['Passport Copy', 'Boarding Pass', 'Medical/Police Reports'],
    riskCategory: 'Standard',
    termsAndConditions: 'Standard InsuraCore Travel terms apply.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  },
  {
    name: 'Domestic Explorer Pack',
    type: PolicyType.TRAVEL,
    description: 'Essential travel insurance for domestic trips within India. Covers flight delays, lost baggage, and minor medical emergencies.',
    premiumAmount: 150,
    coverageAmount: 200000,
    validityPeriod: 1, // 1 month
    eligibility: ['Indian Resident', 'Domestic travel only'],
    benefits: ['Flight Delay Compensation', 'Lost Baggage Fixed Benefit', 'Accidental Injury Cover'],
    exclusions: ['International travel', 'Adventure sports injuries'],
    waitingPeriod: 0,
    maximumClaimAmount: 200000,
    requiredDocuments: ['Flight Tickets', 'Aadhar Card', 'Airline irregularity report'],
    riskCategory: 'Low',
    termsAndConditions: 'Flight delays must exceed 6 hours for compensation.',
    status: PolicyListingStatus.ACTIVE,
    isActive: true,
  }
];

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // Check if we already have policies
    const existingCount = await Policy.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Database already has policies. Skipping seed to prevent duplicates.',
        count: existingCount
      });
    }

    // Insert the default policies
    const created = await Policy.insertMany(DEFAULT_POLICIES);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${created.length} default policies!`,
      policies: created
    });

  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
