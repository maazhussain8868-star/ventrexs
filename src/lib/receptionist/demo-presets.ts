/**
 * ==============================================================================
 * VENTREXS AI — PUBLIC RECEPTIONIST DEMO TRADE PRESETS
 * Specialized trade catalogs, heuristics, FAQs, and qualification rules for US service businesses
 * ==============================================================================
 */

import { ReceptionistService, ReceptionistFAQ, ReceptionistSettings } from '@/types';

export type BusinessTradeType = 'HVAC' | 'Plumbing' | 'Roofing' | 'Electrical' | 'Cleaning' | 'Other';

export interface TradePreset {
  id: BusinessTradeType;
  label: string;
  defaultBusinessName: string;
  tagline: string;
  iconName: string;
  description: string;
  suggestedGreeting: string;
  services: ReceptionistService[];
  faqs: ReceptionistFAQ[];
  quickPrompts: { label: string; text: string; category: string }[];
  qualificationQuestions: string[];
}

export const TRADE_PRESETS: Record<BusinessTradeType, TradePreset> = {
  HVAC: {
    id: 'HVAC',
    label: 'HVAC',
    defaultBusinessName: 'Apex Comfort Heating & Air',
    tagline: 'Heating, Ventilation & Air Conditioning Specialists',
    iconName: 'Flame',
    description: 'Residential & commercial air conditioning, heat pump, and furnace diagnostics & maintenance.',
    suggestedGreeting: 'Thanks for calling Apex Comfort Heating & Air! How can our team help with your heating or cooling system today?',
    services: [
      {
        id: 'svc-hvac-1',
        businessId: 'demo-public-hvac',
        name: 'AC Diagnostic & Emergency Cooling Repair',
        category: 'Cooling',
        description: 'Comprehensive compressor, refrigerant, and electrical diagnostic for AC failure.',
        typicalDurationMinutes: 60,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 89,
      },
      {
        id: 'svc-hvac-2',
        businessId: 'demo-public-hvac',
        name: 'Heat Pump / Furnace Seasonal Tune-Up',
        category: 'Maintenance',
        description: '21-point safety inspection, coil cleaning, and airflow calibration.',
        typicalDurationMinutes: 75,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 129,
      },
      {
        id: 'svc-hvac-3',
        businessId: 'demo-public-hvac',
        name: 'Complete System Replacement Consultation',
        category: 'Installation',
        description: 'In-home load calculation, ductwork evaluation, and free estimate.',
        typicalDurationMinutes: 90,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
    ],
    faqs: [
      {
        question: 'What is your standard diagnostic fee?',
        answer: 'Our standard diagnostic fee is $89, which includes a comprehensive system inspection by a certified technician.',
      },
      {
        question: 'Do you offer emergency after-hours AC repair?',
        answer: 'Yes! We have on-call HVAC technicians available 24/7 for urgent cooling and heating emergencies.',
      },
    ],
    quickPrompts: [
      { label: 'AC Not Cooling', text: 'Hi, my AC stopped blowing cold air this afternoon and the house is warming up.', category: 'Repair' },
      { label: 'Diagnostic Fee', text: 'How much do you charge for a technician diagnostic visit?', category: 'Pricing' },
      { label: 'Schedule Tune-Up', text: 'I want to schedule a seasonal tune-up for my heat pump this Friday.', category: 'Booking' },
      { label: 'Emergency No Heat', text: 'Emergency: It is freezing outside and our furnace completely shut off.', category: 'Emergency' },
    ],
    qualificationQuestions: [
      'Is the system completely unresponsive, or is it running but not blowing cold air?',
      'What is the approximate age of your heating and cooling equipment?',
      'Are you located in our primary service zip code area?',
    ],
  },

  Plumbing: {
    id: 'Plumbing',
    label: 'Plumbing',
    defaultBusinessName: 'Dallas Elite Plumbing Pros',
    tagline: 'Master Plumbers for Drain, Pipe & Water Heater Services',
    iconName: 'Wrench',
    description: 'Rapid-response residential and commercial plumbing, drain cleaning, and water heaters.',
    suggestedGreeting: 'Thank you for calling Dallas Elite Plumbing Pros! How can our master plumbers assist you today?',
    services: [
      {
        id: 'svc-plumb-1',
        businessId: 'demo-public-plumb',
        name: 'Emergency Pipe Burst & Active Leak Repair',
        category: 'Emergency',
        description: 'Immediate shut-off assistance, leak pinpointing, and pipe repair.',
        typicalDurationMinutes: 90,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 149,
      },
      {
        id: 'svc-plumb-2',
        businessId: 'demo-public-plumb',
        name: 'Hydro-Jet Drain Cleaning & Clog Removal',
        category: 'Drains',
        description: 'Camera inspection and high-pressure drain clearing.',
        typicalDurationMinutes: 60,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 99,
      },
      {
        id: 'svc-plumb-3',
        businessId: 'demo-public-plumb',
        name: 'Tankless & Tank Water Heater Installation',
        category: 'Water Heaters',
        description: 'Energy-efficient water heater diagnosis, flush, or full replacement.',
        typicalDurationMinutes: 120,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
    ],
    faqs: [
      {
        question: 'Do you charge a trip fee for estimates?',
        answer: 'We provide clear, upfront flat-rate pricing before starting any work. Routine consultations include a standard diagnostic.',
      },
      {
        question: 'What should I do if a pipe bursts right now?',
        answer: 'Please shut off your main water valve immediately. Our emergency plumbing crew is dispatched immediately.',
      },
    ],
    quickPrompts: [
      { label: 'Severe Pipe Leak', text: 'We have water leaking rapidly from our bathroom ceiling pipe!', category: 'Emergency' },
      { label: 'Clogged Main Drain', text: 'Our kitchen sink and main drain are backing up completely.', category: 'Repair' },
      { label: 'Water Heater Replacement', text: 'Our 50-gallon water heater is 12 years old and leaking from the bottom.', category: 'Consult' },
      { label: 'Schedule Visit', text: 'I need to book a plumbing inspection for tomorrow morning.', category: 'Booking' },
    ],
    qualificationQuestions: [
      'Is water actively overflowing or pooled near electrical outlets?',
      'Have you been able to shut off the main water shutoff valve?',
      'Is this for a single-family home or commercial property?',
    ],
  },

  Roofing: {
    id: 'Roofing',
    label: 'Roofing',
    defaultBusinessName: 'Peak Guard Roofing & Restoration',
    tagline: 'Storm Damage, Tile, Shingle & Flat Roof Experts',
    iconName: 'Shield',
    description: 'Certified roof inspections, leak mitigation, hail damage claims, and re-roofing.',
    suggestedGreeting: 'Thanks for calling Peak Guard Roofing & Restoration! How can our roofing specialists help you today?',
    services: [
      {
        id: 'svc-roof-1',
        businessId: 'demo-public-roof',
        name: 'Emergency Storm Leak Tarping & Patch',
        category: 'Emergency',
        description: 'Urgent weather sealing, tarp installation, and water intrusion prevention.',
        typicalDurationMinutes: 90,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 199,
      },
      {
        id: 'svc-roof-2',
        businessId: 'demo-public-roof',
        name: 'Comprehensive 30-Point Roof & Attic Inspection',
        category: 'Inspection',
        description: 'Drone & physical inspection of shingles, flashing, gutters, and underlayment.',
        typicalDurationMinutes: 60,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
      {
        id: 'svc-roof-3',
        businessId: 'demo-public-roof',
        name: 'Complete Architectural Shingle Replacement',
        category: 'Replacement',
        description: 'Full tear-off, high-durability synthetic felt, and lifetime shingle system.',
        typicalDurationMinutes: 180,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
    ],
    faqs: [
      {
        question: 'Are your roof inspections free?',
        answer: 'Yes, our comprehensive 30-point storm and insurance roof inspections are 100% complimentary for homeowners.',
      },
      {
        question: 'Do you help with insurance storm damage claims?',
        answer: 'Yes! We work directly with all major insurance carriers to provide detailed itemized damage reports.',
      },
    ],
    quickPrompts: [
      { label: 'Active Ceiling Leak', text: 'It started raining and water is dripping through the living room ceiling.', category: 'Emergency' },
      { label: 'Storm Inspection', text: 'We had a severe hail storm yesterday and want a free roof inspection.', category: 'Inspection' },
      { label: 'Shingle Replacement', text: 'A few shingles blew off the ridge in high winds. Can someone come take a look?', category: 'Repair' },
      { label: 'Insurance Claim', text: 'I need an estimate for an insurance claim on our roof.', category: 'Consult' },
    ],
    qualificationQuestions: [
      'Do you see active water staining or drywall dripping inside the house?',
      'Was the roof recently exposed to severe hail, wind, or fallen tree branches?',
      'What type of roof does your property have (architectural shingle, metal, or tile)?',
    ],
  },

  Electrical: {
    id: 'Electrical',
    label: 'Electrical',
    defaultBusinessName: 'Vanguard Electrical Contractors',
    tagline: 'Licensed & Insured Master Electricians',
    iconName: 'Zap',
    description: 'Residential & commercial wiring, 200-amp panel upgrades, EV chargers, and emergency diagnostics.',
    suggestedGreeting: 'Thank you for reaching Vanguard Electrical Contractors! How can our master electricians assist you today?',
    services: [
      {
        id: 'svc-elec-1',
        businessId: 'demo-public-elec',
        name: 'Electrical Diagnostic & Circuit Troubleshooting',
        category: 'Diagnostic',
        description: 'Fault finding, breaker trip isolation, and circuit safety analysis.',
        typicalDurationMinutes: 60,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 95,
      },
      {
        id: 'svc-elec-2',
        businessId: 'demo-public-elec',
        name: '200-Amp Main Service Panel Upgrade',
        category: 'Panel',
        description: 'Modern breaker panel replacement, whole-home surge protector, and city permit.',
        typicalDurationMinutes: 240,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
      {
        id: 'svc-elec-3',
        businessId: 'demo-public-elec',
        name: 'Level 2 Electric Vehicle (EV) Charger Installation',
        category: 'EV Charging',
        description: 'Dedicated 240V/50A line installation with NEMA 14-50 or hardwired unit.',
        typicalDurationMinutes: 120,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 450,
      },
    ],
    faqs: [
      {
        question: 'Are all your electricians licensed and insured?',
        answer: 'Yes, every technician on our team is a state-licensed, insured, and background-checked master or journeyman electrician.',
      },
      {
        question: 'What is your diagnostic rate?',
        answer: 'Our standard residential diagnostic is $95, which covers full testing and a clear upfront quote before any repairs begin.',
      },
    ],
    quickPrompts: [
      { label: 'Breaker Keeps Tripping', text: 'Our kitchen and garage breakers keep tripping every time we turn on an appliance.', category: 'Repair' },
      { label: 'EV Charger Install', text: 'I just bought an electric vehicle and need a Level 2 240V charger installed in my garage.', category: 'Installation' },
      { label: 'Sparking Outlet', text: 'Emergency: An outlet in the laundry room made a popping noise and smells like burning plastic.', category: 'Emergency' },
      { label: 'Panel Upgrade Quote', text: 'Our home still has a 100-amp panel and we need a quote to upgrade to 200 amps.', category: 'Consult' },
    ],
    qualificationQuestions: [
      'Do you notice any burning odor, scorch marks, or buzzing near the breaker panel?',
      'Has the entire house lost power, or is it isolated to specific rooms/circuits?',
      'Are you scheduling for residential or commercial premises?',
    ],
  },

  Cleaning: {
    id: 'Cleaning',
    label: 'Cleaning',
    defaultBusinessName: 'SparklePro Elite Cleaning',
    tagline: 'Eco-Friendly Residential & Commercial Deep Cleaning',
    iconName: 'Sparkles',
    description: 'Move-in/move-out deep cleans, recurring housekeeping, post-construction, and office sanitation.',
    suggestedGreeting: 'Thanks for calling SparklePro Elite Cleaning! How can our professional cleaning team brighten your property today?',
    services: [
      {
        id: 'svc-clean-1',
        businessId: 'demo-public-clean',
        name: 'Whole-Home Move-In / Move-Out Deep Clean',
        category: 'Deep Cleaning',
        description: 'Top-to-bottom scrub including baseboards, oven, fridge interior, and cabinet sanitization.',
        typicalDurationMinutes: 180,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 220,
      },
      {
        id: 'svc-clean-2',
        businessId: 'demo-public-clean',
        name: 'Recurring Residential Maid Service (Bi-Weekly / Monthly)',
        category: 'Recurring',
        description: 'Kitchen, bathrooms, dusting, vacuuming, and floor disinfection.',
        typicalDurationMinutes: 120,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 140,
      },
      {
        id: 'svc-clean-3',
        businessId: 'demo-public-clean',
        name: 'Commercial Office & Facility Sanitization',
        category: 'Commercial',
        description: 'High-touch surface disinfection, trash removal, and breakroom hygiene.',
        typicalDurationMinutes: 150,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
    ],
    faqs: [
      {
        question: 'Do you bring your own cleaning supplies and equipment?',
        answer: 'Yes! Our cleaning specialists arrive with all commercial-grade, non-toxic, eco-friendly supplies and HEPA-filter vacuums.',
      },
      {
        question: 'Are your cleaners bonded and insured?',
        answer: 'Absolutely. All our staff are rigorously vetted, background checked, and fully bonded and insured.',
      },
    ],
    quickPrompts: [
      { label: 'Move-Out Deep Clean', text: 'I need a comprehensive move-out clean for a 3-bedroom home this Thursday.', category: 'Deep Clean' },
      { label: 'Bi-Weekly Maid Service', text: 'What are your rates for recurring bi-weekly residential cleaning?', category: 'Recurring' },
      { label: 'Office Cleaning Quote', text: 'We have a 2,500 sq ft office space and want to get a quote for weekly cleaning.', category: 'Commercial' },
      { label: 'Same-Day Clean', text: 'Do you have any availability for an urgent cleaning appointment tomorrow?', category: 'Booking' },
    ],
    qualificationQuestions: [
      'What is the approximate square footage and number of bedrooms and bathrooms?',
      'Are you interested in a one-time detailed clean or recurring service?',
      'Do you have any pets or specific surface material requirements?',
    ],
  },

  Other: {
    id: 'Other',
    label: 'Other',
    defaultBusinessName: 'Apex Pro Property Services',
    tagline: 'General Contracting & Specialty Home Services',
    iconName: 'Building2',
    description: 'Full-service maintenance, handyman repairs, installations, and property assessments.',
    suggestedGreeting: 'Thank you for calling Apex Pro Property Services! How can our service technicians help you today?',
    services: [
      {
        id: 'svc-other-1',
        businessId: 'demo-public-other',
        name: 'General Service Call & Property Repair Assessment',
        category: 'General',
        description: 'On-site technical evaluation and itemized repair plan.',
        typicalDurationMinutes: 60,
        emergencyAvailable: true,
        bookingEligible: true,
        basePrice: 79,
      },
      {
        id: 'svc-other-2',
        businessId: 'demo-public-other',
        name: 'Routine Preventative Maintenance Visit',
        category: 'Maintenance',
        description: 'Seasonal multi-point facility and equipment inspection.',
        typicalDurationMinutes: 90,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 119,
      },
      {
        id: 'svc-other-3',
        businessId: 'demo-public-other',
        name: 'Custom Project & Renovation Consultation',
        category: 'Consultation',
        description: 'In-person project scoping, timeline estimate, and material quote.',
        typicalDurationMinutes: 60,
        emergencyAvailable: false,
        bookingEligible: true,
        basePrice: 0,
      },
    ],
    faqs: [
      {
        question: 'How quickly can a technician visit my property?',
        answer: 'We typically have same-day and next-day appointment windows available for urgent and routine service calls.',
      },
      {
        question: 'Are you licensed and insured?',
        answer: 'Yes, our business carries full general liability insurance and state licensing.',
      },
    ],
    quickPrompts: [
      { label: 'Schedule Repair', text: 'Hi, I need to schedule a service visit for some urgent repairs at our property.', category: 'Repair' },
      { label: 'Get a Quote', text: 'How much do you charge for a general service inspection?', category: 'Pricing' },
      { label: 'Emergency Tech', text: 'I have an urgent repair issue that needs attention tonight.', category: 'Emergency' },
      { label: 'Speak with Manager', text: 'Can I speak with a representative regarding our commercial account?', category: 'Handoff' },
    ],
    qualificationQuestions: [
      'What specific issue or project do you need assistance with?',
      'Is there an active safety hazard or time-sensitive deadline?',
      'What is the best callback phone number and address for our technician?',
    ],
  },
};

/**
 * Helper to construct receptionist settings customized for a specific demo setup
 */
export function buildDemoReceptionistSettings(params: {
  businessName: string;
  businessType: BusinessTradeType;
  businessPhone?: string;
}): {
  settings: ReceptionistSettings;
  services: ReceptionistService[];
} {
  const preset = TRADE_PRESETS[params.businessType] || TRADE_PRESETS.Other;
  const resolvedName = params.businessName.trim() || preset.defaultBusinessName;

  const greeting = preset.suggestedGreeting.replace(preset.defaultBusinessName, resolvedName);

  const customizedServices: ReceptionistService[] = preset.services.map((s) => ({
    ...s,
    businessId: `demo-tenant-${params.businessType.toLowerCase()}`,
  }));

  const settings: ReceptionistSettings = {
    id: `demo-settings-${params.businessType.toLowerCase()}`,
    businessId: `demo-tenant-${params.businessType.toLowerCase()}`,
    enabled: true,
    greeting,
    businessDescription: `${resolvedName} — ${preset.description}`,
    tone: 'professional',
    languages: ['en'],
    afterHoursMessage: `Thanks for calling ${resolvedName}. We are currently assisting other clients, but our AI assistant can immediately log your ticket and schedule your appointment.`,
    emergencyInstructions: `For emergency service calls, our priority on-call dispatch team will be alerted immediately.`,
    bookingEnabled: true,
    bookingLeadTimeHours: 2,
    bookingMaxDaysAhead: 7,
    humanHandoffKeywords: ['human', 'agent', 'person', 'manager', 'representative', 'real person', 'operator'],
    faqs: preset.faqs,
  };

  return {
    settings,
    services: customizedServices,
  };
}
