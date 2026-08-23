import { 
  Invoice, 
  Customer, 
  CopilotRecommendation, 
  NotificationItem, 
  UserProfile, 
  BusinessSettings, 
  AdminStats 
} from '@/types';

export const initialProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@mainstreetbakery.com',
  role: 'Owner & Operator',
  businessName: 'Main Street Bakery & Cafe',
  businessType: 'Food & Commercial Catering',
  phone: '+1 (555) 382-9912',
  address: '742 Evergreen Terrace, Springfield, IL 62704',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
  plan: 'Professional',
  billingCycle: 'monthly',
  twoFactorEnabled: true,
};

export const initialSettings: BusinessSettings = {
  businessName: 'Main Street Bakery & Cafe',
  businessEmail: 'billing@mainstreetbakery.com',
  taxId: 'XX-XXXX1099',
  currency: 'USD ($)',
  paymentTermsDays: 14,
  defaultNotes: 'Payment is due within 14 days of invoice date. Thank you for choosing Main Street Bakery!',
  stripeConnected: true,
  achConnected: true,
  autoReminderEnabled: true,
};

export const initialAdminStats: AdminStats = {
  mrr: 45200,
  mrrGrowth: 12.4,
  activeUsers: 1240,
  userGrowth: 18.2,
  aiDraftsToday: 850,
  serverUptime: '99.99%',
};

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Michael Scott',
    company: 'Acme Corp',
    email: 'mscott@acmecorp.com',
    phone: '+1 (555) 839-2911',
    address: '1725 Slough Ave, Scranton, PA',
    totalOutstanding: 4800,
    outstandingReceivables: 4800,
    totalPaid: 25400,
    paymentsReceived: 25400,
    overdueCount: 1,
    activeInvoicesCount: 2,
    riskLevel: 'medium',
    creditScore: 710,
    lastContactDate: '3 days ago',
    preferredContact: 'email',
    notes: 'Established wholesale client. Accounts payable runs vendor check & ACH disbursements on alternate Thursdays.'
  },
  {
    id: 'cust-2',
    name: 'Sarah Connor',
    company: 'Global Tech LLC',
    email: 'sconnor@globaltech.io',
    phone: '+1 (555) 492-1102',
    address: '100 Cyberdyne Way, Los Angeles, CA',
    totalOutstanding: 1200,
    outstandingReceivables: 1200,
    totalPaid: 18900,
    paymentsReceived: 18900,
    overdueCount: 1,
    activeInvoicesCount: 1,
    riskLevel: 'low',
    creditScore: 780,
    lastContactDate: 'Yesterday',
    preferredContact: 'email',
    notes: 'Usually settles invoices promptly within 5 days of courtesy notification.'
  },
  {
    id: 'cust-3',
    name: 'Arthur Pendelton',
    company: 'Stellar Solutions',
    email: 'apendelton@stellarsol.com',
    phone: '+1 (555) 301-8492',
    address: '450 North Michigan Ave, Chicago, IL',
    totalOutstanding: 6400,
    outstandingReceivables: 6400,
    totalPaid: 32000,
    paymentsReceived: 32000,
    overdueCount: 1,
    activeInvoicesCount: 2,
    riskLevel: 'high',
    creditScore: 630,
    lastContactDate: '1 week ago',
    preferredContact: 'phone',
    notes: 'High volume catering contracts. Requires direct follow-up with finance director to expedite billing approval.'
  },
  {
    id: 'cust-4',
    name: 'Elena Rostova',
    company: 'Nexus Industries',
    email: 'elena@nexusind.com',
    phone: '+1 (555) 723-9941',
    address: '880 Silicon Blvd, Austin, TX',
    totalOutstanding: 5800,
    outstandingReceivables: 5800,
    totalPaid: 45000,
    paymentsReceived: 45000,
    overdueCount: 0,
    activeInvoicesCount: 1,
    riskLevel: 'low',
    creditScore: 820,
    lastContactDate: '2 weeks ago',
    preferredContact: 'email',
    notes: 'Excellent corporate credit. Automated ACH payments enabled.'
  },
  {
    id: 'cust-5',
    name: 'David Miller',
    company: 'Cascade Creative',
    email: 'david@cascadecreative.design',
    phone: '+1 (555) 194-8201',
    address: '320 Pine St, Seattle, WA',
    totalOutstanding: 0,
    outstandingReceivables: 0,
    totalPaid: 14500,
    paymentsReceived: 14500,
    overdueCount: 0,
    activeInvoicesCount: 0,
    riskLevel: 'low',
    creditScore: 795,
    lastContactDate: '3 weeks ago',
    preferredContact: 'email',
    notes: 'Boutique design agency. Settles invoices on receipt.'
  },
  {
    id: 'cust-6',
    name: 'Marcus Vance',
    company: 'Summit Logistics',
    email: 'mvance@summitlogistics.com',
    phone: '+1 (555) 902-3481',
    address: '1400 Industrial Pkwy, Dallas, TX',
    totalOutstanding: 3200,
    outstandingReceivables: 3200,
    totalPaid: 21000,
    paymentsReceived: 21000,
    overdueCount: 0,
    activeInvoicesCount: 1,
    riskLevel: 'low',
    creditScore: 760,
    lastContactDate: '4 days ago',
    preferredContact: 'email',
    notes: 'Weekly cafeteria bread supply contract. Invoices due Net 14.'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    number: 'INV-2023-089',
    customerId: 'cust-1',
    customerName: 'Michael Scott',
    customerCompany: 'Acme Corp',
    customerEmail: 'mscott@acmecorp.com',
    customerPhone: '+1 (555) 839-2911',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    status: 'overdue',
    priority: 'high',
    items: [
      { id: 'item-1', description: 'Corporate Catering Package - Annual Summit', quantity: 2, unitPrice: 1800, amount: 3600 },
      { id: 'item-2', description: 'Specialty Artisan Pastry Assortment (100 units)', quantity: 2, unitPrice: 600, amount: 1200 },
    ],
    subtotal: 4800,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 4800,
    originalAmountDue: 4800,
    paymentsReceived: 0,
    remainingBalance: 4800,
    daysOverdue: 8,
    notes: 'Delivered to Acme Scranton Regional Headquarters. Net 14 payment terms agreed.',
    timeline: [
      { id: 't1', type: 'created', title: 'Invoice Generated', description: 'Invoice INV-2023-089 created for $4,800.00', timestamp: 'Aug 01, 2026' },
      { id: 't2', type: 'sent', title: 'Invoice Sent to Customer', description: 'Emailed to mscott@acmecorp.com with secure payment link', timestamp: 'Aug 01, 2026' },
      { id: 't3', type: 'viewed', title: 'Invoice Viewed by Customer', description: 'Customer opened invoice via web portal', timestamp: 'Aug 03, 2026' },
      { id: 't4', type: 'reminder_sent', title: 'Due Date Courtesy Reminder', description: 'Automated notification sent 2 days prior to due date', timestamp: 'Aug 13, 2026' },
      { id: 't5', type: 'reminder_sent', title: 'Professional Follow-up Delivered', description: 'Truthful payment notice sent to accounts payable', timestamp: 'Aug 18, 2026' },
    ],
    aiSuggestion: {
      actionType: 'firm',
      insight: 'Acme Corp Accounts Payable approves payment batches on Thursdays. Sending a clear, professional payment confirmation request today has an 88% probability of inclusion in this week’s disbursement.',
      confidence: 88,
      recommendedSubject: 'Payment Status Inquiry: Invoice INV-2023-089 ($4,800.00) - Acme Corp',
      recommendedBody: 'Dear Michael and the Accounts Payable Team,\n\nWe are following up regarding invoice INV-2023-089 for $4,800.00, which was due on Aug 15, 2026 for the Annual Summit catering.\n\nCould you please let us know if this invoice is scheduled in your upcoming Thursday disbursement run? You can easily review and settle the original balance directly online:\nhttps://paypilot.ai/pay/inv-1\n\nThank you for your partnership and prompt attention.\n\nWarm regards,\nJane Doe\nMain Street Bakery & Cafe'
    }
  },
  {
    id: 'inv-2',
    number: 'INV-2023-090',
    customerId: 'cust-2',
    customerName: 'Sarah Connor',
    customerCompany: 'Global Tech LLC',
    customerEmail: 'sconnor@globaltech.io',
    customerPhone: '+1 (555) 492-1102',
    issueDate: '2026-08-05',
    dueDate: '2026-08-19',
    status: 'overdue',
    priority: 'medium',
    items: [
      { id: 'item-3', description: 'Executive Breakfast Board & Espresso Bar Service', quantity: 1, unitPrice: 1200, amount: 1200 }
    ],
    subtotal: 1200,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 1200,
    originalAmountDue: 1200,
    paymentsReceived: 0,
    remainingBalance: 1200,
    daysOverdue: 4,
    notes: 'Bi-weekly tech executive breakfast series.',
    timeline: [
      { id: 't6', type: 'created', title: 'Invoice Generated', timestamp: 'Aug 05, 2026' },
      { id: 't7', type: 'sent', title: 'Sent via Email', timestamp: 'Aug 05, 2026' },
      { id: 't8', type: 'viewed', title: 'Viewed by Client', timestamp: 'Aug 06, 2026' },
    ],
    aiSuggestion: {
      actionType: 'gentle',
      insight: 'Global Tech has a 95% on-time payment track record. A courteous check-in usually results in immediate ACH settlement within 24 hours.',
      confidence: 95,
      recommendedSubject: 'Friendly Reminder: Invoice INV-2023-090 ($1,200.00) - Global Tech',
      recommendedBody: 'Hi Sarah,\n\nI hope your week is off to a wonderful start!\n\nThis is a quick courtesy note regarding invoice INV-2023-090 for $1,200.00 for the executive breakfast board, which was due on Aug 19.\n\nWhenever you have a moment, you can review the invoice and complete settlement securely here:\nhttps://paypilot.ai/pay/inv-2\n\nThank you as always for your business!\n\nBest regards,\nJane Doe'
    }
  },
  {
    id: 'inv-3',
    number: 'INV-2023-091',
    customerId: 'cust-3',
    customerName: 'Arthur Pendelton',
    customerCompany: 'Stellar Solutions',
    customerEmail: 'apendelton@stellarsol.com',
    customerPhone: '+1 (555) 301-8492',
    issueDate: '2026-08-08',
    dueDate: '2026-08-22',
    status: 'overdue',
    priority: 'high',
    items: [
      { id: 'item-4', description: 'Weekly Corporate Lunch Buffet & Dessert Station', quantity: 4, unitPrice: 1600, amount: 6400 }
    ],
    subtotal: 6400,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 6400,
    originalAmountDue: 6400,
    paymentsReceived: 0,
    remainingBalance: 6400,
    daysOverdue: 1,
    notes: 'August 4-week corporate catering series.',
    timeline: [
      { id: 't9', type: 'created', title: 'Invoice Generated', timestamp: 'Aug 08, 2026' },
      { id: 't10', type: 'sent', title: 'Sent to Customer', timestamp: 'Aug 08, 2026' }
    ],
    aiSuggestion: {
      actionType: 'professional',
      insight: 'Invoice passed due date yesterday. Send a clear, concise statement to ensure accounting has all documentation required for prompt payment.',
      confidence: 86,
      recommendedSubject: 'Invoice INV-2023-091 Statement ($6,400.00) - Stellar Solutions',
      recommendedBody: 'Dear Arthur,\n\nWe wanted to share an update regarding invoice INV-2023-091 in the amount of $6,400.00 for August lunch buffet services, which reached its due date on Aug 22.\n\nPlease find the direct payment and statement link below:\nhttps://paypilot.ai/pay/inv-3\n\nIf you have any questions or require any adjustments, please let us know right away.\n\nThank you,\nJane Doe'
    }
  },
  {
    id: 'inv-4',
    number: 'INV-2023-092',
    customerId: 'cust-4',
    customerName: 'Elena Rostova',
    customerCompany: 'Nexus Industries',
    customerEmail: 'elena@nexusind.com',
    customerPhone: '+1 (555) 723-9941',
    issueDate: '2026-08-16',
    dueDate: '2026-08-30',
    status: 'due',
    priority: 'medium',
    items: [
      { id: 'item-5', description: 'Product Launch Gala Catering & Champagne Service', quantity: 1, unitPrice: 5800, amount: 5800 }
    ],
    subtotal: 5800,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 5800,
    originalAmountDue: 5800,
    paymentsReceived: 0,
    remainingBalance: 5800,
    daysOverdue: 0,
    notes: 'Net 14 payment terms.',
    timeline: [
      { id: 't11', type: 'created', title: 'Invoice Generated', timestamp: 'Aug 16, 2026' },
      { id: 't12', type: 'sent', title: 'Sent to Customer', timestamp: 'Aug 16, 2026' },
      { id: 't13', type: 'viewed', title: 'Viewed by AP Manager', timestamp: 'Aug 17, 2026' }
    ]
  },
  {
    id: 'inv-5',
    number: 'INV-2023-093',
    customerId: 'cust-6',
    customerName: 'Marcus Vance',
    customerCompany: 'Summit Logistics',
    customerEmail: 'mvance@summitlogistics.com',
    customerPhone: '+1 (555) 902-3481',
    issueDate: '2026-08-18',
    dueDate: '2026-09-01',
    status: 'due',
    priority: 'low',
    items: [
      { id: 'item-6', description: 'Weekly Bakery Supply & Fresh Bagels Assortment', quantity: 2, unitPrice: 1600, amount: 3200 }
    ],
    subtotal: 3200,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 3200,
    originalAmountDue: 3200,
    paymentsReceived: 0,
    remainingBalance: 3200,
    daysOverdue: 0,
    notes: 'Deliveries scheduled for Monday and Thursday mornings.',
    timeline: [
      { id: 't14', type: 'created', title: 'Invoice Generated', timestamp: 'Aug 18, 2026' },
      { id: 't15', type: 'sent', title: 'Sent to Customer', timestamp: 'Aug 18, 2026' }
    ]
  },
  {
    id: 'inv-6',
    number: 'INV-2023-085',
    customerId: 'cust-5',
    customerName: 'David Miller',
    customerCompany: 'Cascade Creative',
    customerEmail: 'david@cascadecreative.design',
    customerPhone: '+1 (555) 194-8201',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    status: 'paid',
    priority: 'low',
    items: [
      { id: 'item-7', description: 'Brand Re-launch Celebration Pastries & Coffee Bar', quantity: 1, unitPrice: 3500, amount: 3500 }
    ],
    subtotal: 3500,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 3500,
    originalAmountDue: 3500,
    paymentsReceived: 3500,
    remainingBalance: 0,
    daysOverdue: 0,
    paidDate: '2026-08-14',
    notes: 'Paid via Stripe Credit Card on Aug 14.',
    timeline: [
      { id: 't16', type: 'created', title: 'Invoice Created', timestamp: 'Aug 01, 2026' },
      { id: 't17', type: 'sent', title: 'Sent to Client', timestamp: 'Aug 01, 2026' },
      { id: 't18', type: 'payment_received', title: 'Payment Received ($3,500.00)', description: 'Settled in full via Credit Card', timestamp: 'Aug 14, 2026' }
    ]
  },
  {
    id: 'inv-7',
    number: 'INV-2023-084',
    customerId: 'cust-4',
    customerName: 'Elena Rostova',
    customerCompany: 'Nexus Industries',
    customerEmail: 'elena@nexusind.com',
    customerPhone: '+1 (555) 723-9941',
    issueDate: '2026-07-25',
    dueDate: '2026-08-08',
    status: 'paid',
    priority: 'low',
    items: [
      { id: 'item-8', description: 'Board of Directors Luncheon Catering', quantity: 1, unitPrice: 4200, amount: 4200 }
    ],
    subtotal: 4200,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 4200,
    originalAmountDue: 4200,
    paymentsReceived: 4200,
    remainingBalance: 0,
    daysOverdue: 0,
    paidDate: '2026-08-06',
    notes: 'Direct ACH Bank Settlement.',
    timeline: [
      { id: 't19', type: 'created', title: 'Invoice Created', timestamp: 'Jul 25, 2026' },
      { id: 't20', type: 'payment_received', title: 'Payment Received ($4,200.00)', description: 'Direct ACH Bank Transfer', timestamp: 'Aug 06, 2026' }
    ]
  },
  {
    id: 'inv-8',
    number: 'INV-2023-083',
    customerId: 'cust-1',
    customerName: 'Michael Scott',
    customerCompany: 'Acme Corp',
    customerEmail: 'mscott@acmecorp.com',
    customerPhone: '+1 (555) 839-2911',
    issueDate: '2026-07-15',
    dueDate: '2026-07-29',
    status: 'paid',
    priority: 'low',
    items: [
      { id: 'item-9', description: 'Quarterly Staff Appreciation Breakfast', quantity: 1, unitPrice: 2400, amount: 2400 }
    ],
    subtotal: 2400,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 2400,
    originalAmountDue: 2400,
    paymentsReceived: 2400,
    remainingBalance: 0,
    daysOverdue: 0,
    paidDate: '2026-07-28',
    notes: 'Settled on time.',
    timeline: [
      { id: 't21', type: 'created', title: 'Invoice Created', timestamp: 'Jul 15, 2026' },
      { id: 't22', type: 'payment_received', title: 'Payment Received ($2,400.00)', timestamp: 'Jul 28, 2026' }
    ]
  }
];

export const initialRecommendations: CopilotRecommendation[] = [
  {
    id: 'rec-1',
    invoiceId: 'inv-1',
    customerName: 'Acme Corp (Michael Scott)',
    amount: 4800,
    originalAmountDue: 4800,
    daysOverdue: 8,
    priority: 'high',
    aiInsight: 'Customer accounts payable team processes check & ACH batches on Thursdays. Sending a clear, professional payment confirmation inquiry today has an 88% probability of inclusion in this week’s disbursement run.',
    recommendedAction: 'Send Professional Disbursement Inquiry',
    confidence: 88,
    tone: 'firm',
    draftSubject: 'Payment Status Inquiry: Invoice INV-2023-089 ($4,800.00) - Acme Corp',
    draftBody: 'Dear Michael and the Accounts Payable Team,\n\nWe are checking in regarding invoice INV-2023-089 in the amount of $4,800.00 for the Annual Summit catering, which had a due date of Aug 15, 2026.\n\nCould you please let us know if this invoice is scheduled in your upcoming Thursday disbursement run? You can view invoice details and complete payment directly via our client portal:\nhttps://paypilot.ai/pay/inv-1\n\nThank you for your prompt attention and continued partnership.\n\nWarm regards,\nJane Doe\nMain Street Bakery & Cafe',
    status: 'pending'
  },
  {
    id: 'rec-2',
    invoiceId: 'inv-2',
    customerName: 'Global Tech LLC (Sarah Connor)',
    amount: 1200,
    originalAmountDue: 1200,
    daysOverdue: 4,
    priority: 'medium',
    aiInsight: 'Global Tech consistently settles within 24 hours of friendly reminders. Send a courteous check-in with one-click payment link.',
    recommendedAction: 'Send Courteous Check-in',
    confidence: 95,
    tone: 'gentle',
    draftSubject: 'Friendly Reminder: Invoice INV-2023-090 ($1,200.00) - Global Tech',
    draftBody: 'Hi Sarah,\n\nI hope you are having a wonderful week!\n\nThis is a quick reminder regarding invoice INV-2023-090 for $1,200.00 for the executive breakfast board, which reached its due date on Aug 19.\n\nWhenever you have a moment, you can review and settle the invoice securely online:\nhttps://paypilot.ai/pay/inv-2\n\nThank you for your business!\n\nWarm regards,\nJane Doe',
    status: 'pending'
  },
  {
    id: 'rec-3',
    invoiceId: 'inv-3',
    customerName: 'Stellar Solutions (Arthur Pendelton)',
    amount: 6400,
    originalAmountDue: 6400,
    daysOverdue: 1,
    priority: 'high',
    aiInsight: 'Invoice passed due date yesterday. High contract balance. Send formal statement to ensure accounting has all documentation needed for release of funds.',
    recommendedAction: 'Send Formal Account Statement',
    confidence: 86,
    tone: 'professional',
    draftSubject: 'Invoice INV-2023-091 Statement ($6,400.00) - Stellar Solutions',
    draftBody: 'Dear Arthur,\n\nWe wanted to share an update regarding invoice INV-2023-091 in the amount of $6,400.00 for August lunch buffet services, which reached its due date on Aug 22.\n\nPlease find the direct payment and statement link below:\nhttps://paypilot.ai/pay/inv-3\n\nIf you have any questions or require any adjustments, please let us know right away.\n\nThank you,\nJane Doe',
    status: 'pending'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Payment Received: $3,500.00',
    message: 'Cascade Creative settled Invoice INV-2023-085 in full via Credit Card.',
    timestamp: '2 hours ago',
    read: false,
    type: 'payment',
    linkUrl: '/invoices/inv-6'
  },
  {
    id: 'notif-2',
    title: 'New AI Collection Insight',
    message: 'AI Copilot generated a high-confidence disbursement inquiry for Acme Corp ($4,800.00).',
    timestamp: '5 hours ago',
    read: false,
    type: 'copilot',
    linkUrl: '/copilot'
  },
  {
    id: 'notif-3',
    title: 'Invoice Due Date Approaching',
    message: 'Nexus Industries Invoice INV-2023-092 ($5,800.00) is due in 7 days.',
    timestamp: '1 day ago',
    read: true,
    type: 'overdue',
    linkUrl: '/invoices/inv-4'
  }
];
