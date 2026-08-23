-- ==============================================================================
-- PAYPILOT AI — SEED DATA SCRIPT
-- Multi-Tenant Demo Data for Development & Cross-Business Isolation Testing
-- ==============================================================================

-- 1. Create Demo Businesses
INSERT INTO public.businesses (id, name, industry, email, phone, address, tax_id, currency, payment_terms_days, default_notes, stripe_connected, ach_connected, auto_reminder_enabled)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Main Street Bakery & Cafe',
        'Bakery, Food & Catering',
        'billing@mainstreetbakery.com',
        '+1 (555) 382-9912',
        '742 Evergreen Terrace, Springfield, IL 62704',
        'US-8829102-X',
        'USD ($)',
        14,
        'Thank you for your business! Please settle your original balance within payment terms.',
        true,
        true,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Apex Industrial HVAC',
        'HVAC, Plumbing & Electrical',
        'accounts@apexhvac.com',
        '+1 (555) 902-3114',
        '1040 Industrial Pkwy, Cleveland, OH 44101',
        'US-9182374-Y',
        'USD ($)',
        30,
        'Standard Net 30 Commercial Invoicing. Direct ACH payments preferred.',
        true,
        true,
        true
    )
ON CONFLICT (id) DO NOTHING;

-- 2. Create Subscriptions
INSERT INTO public.subscriptions (id, business_id, plan, billing_cycle, status, price_amount, trial_ends_at)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Professional',
        'monthly',
        'active',
        49.00,
        timezone('utc'::text, now() + interval '14 days')
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Starter',
        'monthly',
        'active',
        19.00,
        timezone('utc'::text, now() + interval '7 days')
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Create Customers for Business A (Main Street Bakery)
INSERT INTO public.customers (id, business_id, name, company, email, phone, address, payment_terms, risk_level, credit_score, preferred_contact, notes)
VALUES 
    (
        'c1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'Marcus Sterling',
        'Sterling & Stone Hospitality',
        'marcus@sterlingstone.com',
        '+1 (555) 492-1829',
        '1200 Grand Ave, Suite 400, Chicago, IL',
        14,
        'high',
        590,
        'email',
        'Longstanding corporate catering client. Typically pays on 2nd follow-up.'
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'Elena Rostova',
        'Vanguard Media Group',
        'elena.r@vanguardmedia.io',
        '+1 (555) 831-2940',
        '450 Market St, 12th Floor, San Francisco, CA',
        14,
        'medium',
        680,
        'email',
        'Weekly event bakery delivery. Fast responder via email.'
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'David Chen',
        'Apex Logistics Co.',
        'dchen@apexlogistics.com',
        '+1 (555) 201-9483',
        '88 Industrial Way, Dallas, TX',
        30,
        'low',
        780,
        'email',
        'Reliable partner. Usually initiates automated ACH before due date.'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Create Customers for Business B (Apex HVAC) - Cross-tenant isolation verification
INSERT INTO public.customers (id, business_id, name, company, email, phone, address, payment_terms, risk_level, credit_score, preferred_contact, notes)
VALUES 
    (
        'c9999999-9999-9999-9999-999999999999',
        '22222222-2222-2222-2222-222222222222',
        'Robert Miller',
        'Buckeye Warehousing LLC',
        'rmiller@buckeyewarehouse.com',
        '+1 (555) 777-1234',
        '500 Warehouse Rd, Columbus, OH',
        30,
        'low',
        790,
        'email',
        'Commercial HVAC maintenance contract.'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Create Invoices for Business A (Main Street Bakery)
-- Halal-First Integrity: remaining_balance = original_amount - amount_paid
INSERT INTO public.invoices (
    id, business_id, customer_id, invoice_number, issue_date, due_date, currency, 
    subtotal, tax_rate, tax_amount, discount_amount, original_amount, amount_paid, remaining_balance, 
    status, priority, paid_date, notes
) VALUES 
    (
        'i1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'c1111111-1111-1111-1111-111111111111',
        'INV-2026-001',
        '2026-08-01',
        '2026-08-15',
        'USD',
        4200.00,
        5.00,
        210.00,
        0.00,
        4410.00,
        0.00,
        4410.00,
        'overdue',
        'high',
        NULL,
        'Executive Summer Summit catering - 3 day banquet services'
    ),
    (
        'i2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'c2222222-2222-2222-2222-222222222222',
        'INV-2026-002',
        '2026-08-10',
        '2026-08-24',
        'USD',
        2800.00,
        5.00,
        140.00,
        100.00,
        2840.00,
        0.00,
        2840.00,
        'due',
        'medium',
        NULL,
        'Bi-weekly artisanal breakfast service'
    ),
    (
        'i3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'c3333333-3333-3333-3333-333333333333',
        'INV-2026-003',
        '2026-07-15',
        '2026-07-29',
        'USD',
        3500.00,
        0.00,
        0.00,
        0.00,
        3500.00,
        3500.00,
        0.00,
        'paid',
        'low',
        '2026-07-28',
        'Corporate luncheon series - fully settled'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Create Invoice Items for Business A
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_amount, discount_amount, line_total)
VALUES 
    (
        't1111111-1111-1111-1111-111111111111',
        'i1111111-1111-1111-1111-111111111111',
        'Executive Catering - Gourmet Breakfast & Lunch Buffet (3 Days)',
        3.00,
        1200.00,
        180.00,
        0.00,
        3600.00
    ),
    (
        't2222222-2222-2222-2222-222222222222',
        'i1111111-1111-1111-1111-111111111111',
        'Artisanal Dessert & Barista Station Setup',
        1.00,
        600.00,
        30.00,
        0.00,
        600.00
    ),
    (
        't3333333-3333-3333-3333-333333333333',
        'i2222222-2222-2222-2222-222222222222',
        'Daily Croissant & Pastry Platter Service (10 Days)',
        10.00,
        280.00,
        140.00,
        100.00,
        2700.00
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Create Payment for Invoice 3 (Main Street Bakery)
INSERT INTO public.payments (id, business_id, invoice_id, amount, payment_date, method, reference, notes)
VALUES 
    (
        'p3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'i3333333-3333-3333-3333-333333333333',
        3500.00,
        '2026-07-28 14:32:00+00',
        'ACH Transfer',
        'ACH-88392019',
        'Full invoice settlement received via direct bank debit.'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Create Timeline Events for Invoices
INSERT INTO public.invoice_events (id, invoice_id, business_id, event_type, title, description, metadata)
VALUES 
    (
        'e1111111-1111-1111-1111-111111111111',
        'i1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'created',
        'Invoice Created',
        'Created for Sterling & Stone Hospitality',
        '{"amount": 4410.00}'::jsonb
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        'i1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'sent',
        'Sent to Customer',
        'Delivered to marcus@sterlingstone.com',
        '{"channel": "email"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 9. Create AI Recommendations (Halal-First: Respectful, Truthful, Zero Interest)
INSERT INTO public.ai_recommendations (
    id, business_id, invoice_id, customer_name, amount, days_overdue, 
    priority, recommended_action, reason, tone, message_draft_subject, message_draft, confidence, status
) VALUES 
    (
        'r1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'i1111111-1111-1111-1111-111111111111',
        'Marcus Sterling',
        4410.00,
        8,
        'high',
        'Dispatch courteous follow-up note referencing original contract date',
        'Customer typically settles accounts receivable within 10 days when reminded professionally.',
        'firm',
        'Payment Status Follow-up: Invoice INV-2026-001 ($4,410.00) - Sterling & Stone Hospitality',
        'Dear Marcus,\n\nOur accounting records show that invoice INV-2026-001 for the original amount of $4,410.00 reached its due date on August 15, 2026 and remains open.\n\nWe value our relationship with Sterling & Stone Hospitality and kindly request that this original balance be scheduled for settlement at your earliest convenience:\nhttps://paypilot.ai/pay/i1111111-1111-1111-1111-111111111111\n\nThank you for your prompt attention,\nMain Street Bakery & Cafe',
        0.94,
        'pending'
    )
ON CONFLICT (id) DO NOTHING;

-- 10. Create Notifications
INSERT INTO public.notifications (id, business_id, user_id, type, title, message, link_url, read)
VALUES 
    (
        'n1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'payment',
        'Payment Received: $3,500.00',
        'Apex Logistics Co. settled $3,500.00 on INV-2026-003 via ACH Transfer.',
        '/invoices/i3333333-3333-3333-3333-333333333333',
        false
    ),
    (
        'n2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'overdue',
        'Invoice Overdue: INV-2026-001',
        'Sterling & Stone Hospitality ($4,410.00) is 8 days past due.',
        '/invoices/i1111111-1111-1111-1111-111111111111',
        false
    )
ON CONFLICT (id) DO NOTHING;
