--
-- PostgreSQL seed data for Minivoda (new schema)
--

-- Ensure pgcrypto is available (needed for crypt/gen_salt used below)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


-- ============================================================================
-- 0. AUTH USERS (Supabase auth.users — must come before public.users)
-- ============================================================================

-- Admin user (god-mode)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaa0-ad00-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@nivoda.com',
  extensions.crypt('Nivoda123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"name":"Admin User"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Sarah Mitchell (buyer)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaa0-0001-4000-8000-000000000001',
  'authenticated', 'authenticated',
  'sarah@brilliance-jewellers.com',
  extensions.crypt('Nivoda123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Sarah Mitchell"}'::jsonb,
  now(), now(), '', '', '', ''
);

-- Hans Weber (buyer)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaa0-0002-4000-8000-000000000001',
  'authenticated', 'authenticated',
  'hans@weber-schmuck.de',
  extensions.crypt('Nivoda123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Hans Weber"}'::jsonb,
  now(), now(), '', '', '', ''
);

-- Emily Chen (buyer)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaa0-0003-4000-8000-000000000001',
  'authenticated', 'authenticated',
  'emily@parkavenuediamonds.com',
  extensions.crypt('Nivoda123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Emily Chen"}'::jsonb,
  now(), now(), '', '', '', ''
);

-- Identities for all users
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
  ('aaaaaaa0-ad00-4000-8000-000000000001', 'aaaaaaa0-ad00-4000-8000-000000000001', 'admin@nivoda.com', '{"sub":"aaaaaaa0-ad00-4000-8000-000000000001","email":"admin@nivoda.com"}'::jsonb, 'email', now(), now(), now()),
  ('aaaaaaa0-0001-4000-8000-000000000001', 'aaaaaaa0-0001-4000-8000-000000000001', 'sarah@brilliance-jewellers.com', '{"sub":"aaaaaaa0-0001-4000-8000-000000000001","email":"sarah@brilliance-jewellers.com"}'::jsonb, 'email', now(), now(), now()),
  ('aaaaaaa0-0002-4000-8000-000000000001', 'aaaaaaa0-0002-4000-8000-000000000001', 'hans@weber-schmuck.de', '{"sub":"aaaaaaa0-0002-4000-8000-000000000001","email":"hans@weber-schmuck.de"}'::jsonb, 'email', now(), now(), now()),
  ('aaaaaaa0-0003-4000-8000-000000000001', 'aaaaaaa0-0003-4000-8000-000000000001', 'emily@parkavenuediamonds.com', '{"sub":"aaaaaaa0-0003-4000-8000-000000000001","email":"emily@parkavenuediamonds.com"}'::jsonb, 'email', now(), now(), now());


-- ============================================================================
-- 1. LOOKUP TABLES (no dependencies)
-- ============================================================================

--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000001', 'United Kingdom', 1);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000002', 'Germany', 2);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000003', 'United States', 3);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000004', 'India', 4);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000005', 'Belgium', 5);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000006', 'Thailand', 6);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000007', 'Israel', 7);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000008', 'Italy', 8);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000009', 'France', 9);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000010', 'Netherlands', 10);
INSERT INTO public.countries VALUES ('a1000018-0001-4000-8000-000000000011', 'Switzerland', 11);


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.currencies VALUES ('a1000019-0001-4000-8000-000000000001', 'USD', 1);
INSERT INTO public.currencies VALUES ('a1000019-0001-4000-8000-000000000002', 'EUR', 2);
INSERT INTO public.currencies VALUES ('a1000019-0001-4000-8000-000000000003', 'GBP', 3);


--
-- Data for Name: shapes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000001', 'Round', 1);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000002', 'Oval', 2);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000003', 'Cushion', 3);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000004', 'Emerald', 4);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000005', 'Pear', 5);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000006', 'Marquise', 6);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000007', 'Princess', 7);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000008', 'Radiant', 8);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000009', 'Asscher', 9);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000010', 'Heart', 10);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000011', 'Emerald-cut', 11);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000012', 'Cabochon', 12);
INSERT INTO public.shapes VALUES ('a1000001-0001-4000-8000-000000000013', 'Tapered Baguette', 13);


--
-- Data for Name: diamond_colors; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000001', 'D', 1);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000002', 'E', 2);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000003', 'F', 3);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000004', 'G', 4);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000005', 'H', 5);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000006', 'I', 6);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000007', 'J', 7);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000008', 'K', 8);
INSERT INTO public.diamond_colors VALUES ('a1000002-0001-4000-8000-000000000009', 'L', 9);


--
-- Data for Name: diamond_clarity_grades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000001', 'IF', 1);
INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000002', 'VVS1', 2);
INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000003', 'VVS2', 3);
INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000004', 'VS1', 4);
INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000005', 'VS2', 5);
INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000006', 'SI1', 6);
INSERT INTO public.diamond_clarity_grades VALUES ('a1000003-0001-4000-8000-000000000007', 'SI2', 7);


--
-- Data for Name: diamond_cut_grades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.diamond_cut_grades VALUES ('a1000004-0001-4000-8000-000000000001', 'Excellent', 1);
INSERT INTO public.diamond_cut_grades VALUES ('a1000004-0001-4000-8000-000000000002', 'Very Good', 2);
INSERT INTO public.diamond_cut_grades VALUES ('a1000004-0001-4000-8000-000000000003', 'Good', 3);
INSERT INTO public.diamond_cut_grades VALUES ('a1000004-0001-4000-8000-000000000004', 'Fair', 4);


--
-- Data for Name: diamond_polish_grades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.diamond_polish_grades VALUES ('a1000005-0001-4000-8000-000000000001', 'Excellent', 1);
INSERT INTO public.diamond_polish_grades VALUES ('a1000005-0001-4000-8000-000000000002', 'Very Good', 2);
INSERT INTO public.diamond_polish_grades VALUES ('a1000005-0001-4000-8000-000000000003', 'Good', 3);


--
-- Data for Name: diamond_symmetry_grades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.diamond_symmetry_grades VALUES ('a1000006-0001-4000-8000-000000000001', 'Excellent', 1);
INSERT INTO public.diamond_symmetry_grades VALUES ('a1000006-0001-4000-8000-000000000002', 'Very Good', 2);
INSERT INTO public.diamond_symmetry_grades VALUES ('a1000006-0001-4000-8000-000000000003', 'Good', 3);


--
-- Data for Name: diamond_fluorescence_levels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.diamond_fluorescence_levels VALUES ('a1000007-0001-4000-8000-000000000001', 'None', 1);
INSERT INTO public.diamond_fluorescence_levels VALUES ('a1000007-0001-4000-8000-000000000002', 'Faint', 2);
INSERT INTO public.diamond_fluorescence_levels VALUES ('a1000007-0001-4000-8000-000000000003', 'Medium', 3);
INSERT INTO public.diamond_fluorescence_levels VALUES ('a1000007-0001-4000-8000-000000000004', 'Strong', 4);


--
-- Data for Name: gemstone_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000001', 'Ruby', 1);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000002', 'Sapphire', 2);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000003', 'Emerald', 3);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000004', 'Tanzanite', 4);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000005', 'Alexandrite', 5);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000006', 'Aquamarine', 6);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000007', 'Morganite', 7);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000008', 'Tourmaline', 8);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000009', 'Spinel', 9);
INSERT INTO public.gemstone_types VALUES ('a1000008-0001-4000-8000-000000000010', 'Garnet', 10);


--
-- Data for Name: gemstone_cut_grades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.gemstone_cut_grades VALUES ('a1000020-0001-4000-8000-000000000001', 'Excellent', 1);
INSERT INTO public.gemstone_cut_grades VALUES ('a1000020-0001-4000-8000-000000000002', 'Very Good', 2);
INSERT INTO public.gemstone_cut_grades VALUES ('a1000020-0001-4000-8000-000000000003', 'Good', 3);
INSERT INTO public.gemstone_cut_grades VALUES ('a1000020-0001-4000-8000-000000000004', 'Fair', 4);


--
-- Data for Name: gemstone_treatments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.gemstone_treatments VALUES ('a1000009-0001-4000-8000-000000000001', 'Unheated', 1);
INSERT INTO public.gemstone_treatments VALUES ('a1000009-0001-4000-8000-000000000002', 'Heated', 2);
INSERT INTO public.gemstone_treatments VALUES ('a1000009-0001-4000-8000-000000000003', 'Oiled', 3);
INSERT INTO public.gemstone_treatments VALUES ('a1000009-0001-4000-8000-000000000004', 'None', 4);


--
-- Data for Name: gemstone_origins; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000001', 'Myanmar', 1);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000002', 'Mozambique', 2);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000003', 'Madagascar', 3);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000004', 'Kashmir', 4);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000005', 'Sri Lanka', 5);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000006', 'Colombia', 6);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000007', 'Brazil', 7);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000008', 'Tanzania', 8);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000009', 'Thailand', 9);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000010', 'Vietnam', 10);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000011', 'Afghanistan', 11);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000012', 'Zambia', 12);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000013', 'Nigeria', 13);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000014', 'Kenya', 14);
INSERT INTO public.gemstone_origins VALUES ('a1000010-0001-4000-8000-000000000015', 'Ethiopia', 15);


--
-- Data for Name: certification_labs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.certification_labs VALUES ('a1000011-0001-4000-8000-000000000001', 'GIA', 1);
INSERT INTO public.certification_labs VALUES ('a1000011-0001-4000-8000-000000000002', 'IGI', 2);
INSERT INTO public.certification_labs VALUES ('a1000011-0001-4000-8000-000000000003', 'GRS', 3);
INSERT INTO public.certification_labs VALUES ('a1000011-0001-4000-8000-000000000004', 'Gubelin', 4);
INSERT INTO public.certification_labs VALUES ('a1000011-0001-4000-8000-000000000005', 'SSEF', 5);
INSERT INTO public.certification_labs VALUES ('a1000011-0001-4000-8000-000000000006', 'AGL', 6);


--
-- Data for Name: metals; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000001', '14k_yellow_gold', 1);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000002', '18k_yellow_gold', 2);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000003', '14k_rose_gold', 3);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000004', '18k_rose_gold', 4);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000005', '10k_white_gold', 5);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000006', '14k_white_gold', 6);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000007', '18k_white_gold', 7);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000008', '950_platinum', 8);


--
-- Data for Name: band_styles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000001', 'Solitaire', 1);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000002', 'Halo', 2);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000003', 'Three Stone', 3);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000004', 'Pave', 4);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000005', 'Channel Set', 5);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000006', 'Bezel', 6);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000007', 'Vintage', 7);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000008', 'Cathedral', 8);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000009', 'Twisted', 9);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000010', 'Cluster', 10);
INSERT INTO public.band_styles VALUES ('a1000015-0001-4000-8000-000000000011', 'Tension', 11);


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payment_methods VALUES ('a1000017-0001-4000-8000-000000000001', 'Pay in 30 days', 1);
INSERT INTO public.payment_methods VALUES ('a1000017-0001-4000-8000-000000000002', 'Credit card', 2);
INSERT INTO public.payment_methods VALUES ('a1000017-0001-4000-8000-000000000003', 'Wire transfer', 3);


--
-- Data for Name: order_event_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000001', 'requested', 1);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000002', 'confirmed', 2);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000003', 'manufacturing', 3);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000004', 'shipped', 4);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000005', 'out_for_delivery', 5);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000006', 'delivered', 6);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000007', 'returned', 7);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000008', 'cancelled', 8);
INSERT INTO public.order_event_types VALUES ('a1000021-0001-4000-8000-000000000009', 'delayed', 9);


--
-- Data for Name: invoice_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.invoice_statuses VALUES ('a1000022-0001-4000-8000-000000000001', 'issued', 1);
INSERT INTO public.invoice_statuses VALUES ('a1000022-0001-4000-8000-000000000002', 'partially_paid', 2);
INSERT INTO public.invoice_statuses VALUES ('a1000022-0001-4000-8000-000000000003', 'paid', 3);
INSERT INTO public.invoice_statuses VALUES ('a1000022-0001-4000-8000-000000000004', 'overdue', 4);
INSERT INTO public.invoice_statuses VALUES ('a1000022-0001-4000-8000-000000000005', 'cancelled', 5);


--
-- Data for Name: ledger_entry_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ledger_entry_types VALUES ('a1000023-0001-4000-8000-000000000001', 'order_charge', 1);
INSERT INTO public.ledger_entry_types VALUES ('a1000023-0001-4000-8000-000000000002', 'payment', 2);
INSERT INTO public.ledger_entry_types VALUES ('a1000023-0001-4000-8000-000000000003', 'fine', 3);
INSERT INTO public.ledger_entry_types VALUES ('a1000023-0001-4000-8000-000000000004', 'credit', 4);
INSERT INTO public.ledger_entry_types VALUES ('a1000023-0001-4000-8000-000000000005', 'reimbursement', 5);


--
-- Data for Name: payment_terms; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000001', 'advance_payment', 1);
INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000002', 'pay_in_3_days', 2);
INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000003', 'pay_in_30_days', 3);
INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000004', 'pay_in_60_days', 4);


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000001', 'natural_diamond', 1);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000002', 'lab_grown_diamond', 2);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000003', 'gemstone', 3);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000004', 'natural_melee', 4);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000005', 'lab_grown_melee', 5);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000006', 'engagement_ring', 6);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000007', 'wedding_band', 7);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000008', 'tennis_bracelet', 8);


-- ============================================================================
-- 2. USERS, ADDRESSES & SUPPLIERS
-- ============================================================================

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('b1000001-0001-4000-8000-000000000001', 'aaaaaaa0-0001-4000-8000-000000000001', 'sarah@brilliance-jewellers.com', 'Sarah Mitchell', 'Brilliance Jewellers Ltd', '+44 20 7946 0958', true, 'a1000019-0001-4000-8000-000000000001', '2024-06-15 09:30:00+00', '2025-11-20 14:12:00+00', NULL);
INSERT INTO public.users VALUES ('b1000001-0001-4000-8000-000000000002', 'aaaaaaa0-0002-4000-8000-000000000001', 'hans@weber-schmuck.de', 'Hans Weber', 'Weber Schmuck GmbH', '+49 30 1234 5678', true, 'a1000019-0001-4000-8000-000000000002', '2024-08-22 11:00:00+00', '2025-12-01 08:45:00+00', NULL);
INSERT INTO public.users VALUES ('b1000001-0001-4000-8000-000000000003', 'aaaaaaa0-0003-4000-8000-000000000001', 'emily@parkavenuediamonds.com', 'Emily Chen', 'Park Avenue Diamonds', '+1 212 555 0147', true, 'a1000019-0001-4000-8000-000000000001', '2025-01-10 16:20:00+00', '2026-02-28 10:30:00+00', NULL);
INSERT INTO public.users VALUES ('b1000001-0001-4000-8000-000000000099', 'aaaaaaa0-ad00-4000-8000-000000000001', 'admin@nivoda.com', 'Admin User', 'Minivoda Admin', NULL, true, 'a1000019-0001-4000-8000-000000000001', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', NULL);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.addresses VALUES ('b3000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', 'London Showroom', '47 Hatton Garden', 'London', NULL, 'EC1N 8YS', 'a1000018-0001-4000-8000-000000000001', true, '2024-06-15 09:30:00+00', '2024-06-15 09:30:00+00', NULL);
INSERT INTO public.addresses VALUES ('b3000001-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000002', 'Berlin Branch', 'Friedrichstrasse 171', 'Berlin', 'Berlin', '10117', 'a1000018-0001-4000-8000-000000000002', true, '2024-08-22 11:00:00+00', '2024-08-22 11:00:00+00', NULL);
INSERT INTO public.addresses VALUES ('b3000001-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000003', 'NYC Office', '580 Fifth Avenue, Suite 1205', 'New York', 'NY', '10036', 'a1000018-0001-4000-8000-000000000003', true, '2025-01-10 16:20:00+00', '2025-01-10 16:20:00+00', NULL);
INSERT INTO public.addresses VALUES ('b3000001-0001-4000-8000-000000000004', 'b1000001-0001-4000-8000-000000000001', 'Birmingham Workshop', '12 Vyse Street', 'Birmingham', NULL, 'B18 6LT', 'a1000018-0001-4000-8000-000000000001', false, '2025-03-01 10:00:00+00', '2025-03-01 10:00:00+00', NULL);


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.suppliers VALUES ('b2000001-0001-4000-8000-000000000001', 'Mumbai Diamond Trading Co.', 'SUP-001', 'a1000018-0001-4000-8000-000000000004', 'sales@mumbai-diamonds.in', '2023-03-01 08:00:00+00', '2025-10-15 12:00:00+00', NULL);
INSERT INTO public.suppliers VALUES ('b2000001-0001-4000-8000-000000000002', 'Antwerp Gem House', 'SUP-002', 'a1000018-0001-4000-8000-000000000005', 'info@antwerp-gems.be', '2023-03-15 09:00:00+00', '2025-09-20 11:30:00+00', NULL);
INSERT INTO public.suppliers VALUES ('b2000001-0001-4000-8000-000000000003', 'Bangkok Gemstones Ltd', 'SUP-003', 'a1000018-0001-4000-8000-000000000006', 'export@bangkok-gems.co.th', '2023-06-10 07:00:00+00', '2025-11-01 14:45:00+00', NULL);
INSERT INTO public.suppliers VALUES ('b2000001-0001-4000-8000-000000000004', 'Tel Aviv Precision Cuts', 'SUP-004', 'a1000018-0001-4000-8000-000000000007', 'orders@tavcuts.co.il', '2023-09-20 10:00:00+00', '2025-08-12 09:15:00+00', NULL);
INSERT INTO public.suppliers VALUES ('b2000001-0001-4000-8000-000000000005', 'Italian Fine Mounts Srl', 'SUP-005', 'a1000018-0001-4000-8000-000000000008', 'vendite@italianmounts.it', '2024-01-05 08:30:00+00', '2025-12-10 16:00:00+00', NULL);


-- ============================================================================
-- 3. PRODUCTS BASE
-- ============================================================================

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, supplier_id, stock_id, product_category_id, price_usd, description, is_active, created_at, updated_at, deleted_at
-- NOTE: price_per_carat_usd and exchange_rate_eur removed from products table
--

-- Natural diamonds (product_category_id = natural_diamond)
INSERT INTO public.products VALUES ('64303031-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303031', 'a1000025-0001-4000-8000-000000000001', 18750, '1.01ct Round D IF Excellent Cut', true, '2025-10-15 08:30:00+00', '2025-10-15 08:30:00+00', NULL);
INSERT INTO public.products VALUES ('64303032-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303032', 'a1000025-0001-4000-8000-000000000001', 4890, '0.71ct Round E VVS1 Excellent Cut', true, '2025-10-15 08:35:00+00', '2025-10-15 08:35:00+00', NULL);
INSERT INTO public.products VALUES ('64303033-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303033', 'a1000025-0001-4000-8000-000000000001', 28400, '2.03ct Round F VS1 Excellent Cut', true, '2025-10-15 08:40:00+00', '2025-10-15 08:40:00+00', NULL);
INSERT INTO public.products VALUES ('64303034-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303034', 'a1000025-0001-4000-8000-000000000001', 14200, '1.50ct Round G VVS2 Very Good Cut', true, '2025-10-15 08:45:00+00', '2025-10-15 08:45:00+00', NULL);
INSERT INTO public.products VALUES ('64303035-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303035', 'a1000025-0001-4000-8000-000000000001', 2850, '0.50ct Round D VS2 Excellent Cut', true, '2025-10-15 08:50:00+00', '2025-10-15 08:50:00+00', NULL);
INSERT INTO public.products VALUES ('64303036-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303036', 'a1000025-0001-4000-8000-000000000001', 89500, '3.21ct Round E VS1 Excellent Cut', true, '2025-10-15 08:55:00+00', '2025-10-15 08:55:00+00', NULL);
INSERT INTO public.products VALUES ('64303037-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303037', 'a1000025-0001-4000-8000-000000000001', 5950, '1.20ct Round H SI1 Very Good Cut', true, '2025-10-15 09:00:00+00', '2025-10-15 09:00:00+00', NULL);
INSERT INTO public.products VALUES ('64303038-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303038', 'a1000025-0001-4000-8000-000000000001', 148500, '5.02ct Round D VVS1 Excellent Cut', true, '2025-10-15 09:05:00+00', '2025-10-15 09:05:00+00', NULL);
INSERT INTO public.products VALUES ('64303039-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303039', 'a1000025-0001-4000-8000-000000000001', 17200, '1.52ct Oval D VVS2', true, '2025-10-15 09:10:00+00', '2025-10-15 09:10:00+00', NULL);
INSERT INTO public.products VALUES ('64303130-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303130', 'a1000025-0001-4000-8000-000000000001', 24600, '2.10ct Oval F VS1', true, '2025-10-15 09:15:00+00', '2025-10-15 09:15:00+00', NULL);
INSERT INTO public.products VALUES ('64303131-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303131', 'a1000025-0001-4000-8000-000000000001', 4200, '0.90ct Oval G VS2', true, '2025-10-15 09:20:00+00', '2025-10-15 09:20:00+00', NULL);
INSERT INTO public.products VALUES ('64303132-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303132', 'a1000025-0001-4000-8000-000000000001', 22800, '1.75ct Oval E IF', true, '2025-10-15 09:25:00+00', '2025-10-15 09:25:00+00', NULL);
INSERT INTO public.products VALUES ('64303133-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303133', 'a1000025-0001-4000-8000-000000000001', 42500, '3.55ct Oval H VVS1', true, '2025-10-15 09:30:00+00', '2025-10-15 09:30:00+00', NULL);
INSERT INTO public.products VALUES ('64303134-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303134', 'a1000025-0001-4000-8000-000000000001', 11250, '1.30ct Cushion F VVS1', true, '2025-10-15 09:35:00+00', '2025-10-15 09:35:00+00', NULL);
INSERT INTO public.products VALUES ('64303135-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303135', 'a1000025-0001-4000-8000-000000000001', 18900, '2.41ct Cushion G VS2', true, '2025-10-15 09:40:00+00', '2025-10-15 09:40:00+00', NULL);
INSERT INTO public.products VALUES ('64303136-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303136', 'a1000025-0001-4000-8000-000000000001', 4650, '0.80ct Cushion D VS1', true, '2025-10-15 09:45:00+00', '2025-10-15 09:45:00+00', NULL);
INSERT INTO public.products VALUES ('64303137-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303137', 'a1000025-0001-4000-8000-000000000001', 72800, '4.10ct Cushion E VVS2', true, '2025-10-15 09:50:00+00', '2025-10-15 09:50:00+00', NULL);
INSERT INTO public.products VALUES ('64303138-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303138', 'a1000025-0001-4000-8000-000000000001', 15800, '1.55ct Emerald E VVS1', true, '2025-10-15 09:55:00+00', '2025-10-15 09:55:00+00', NULL);
INSERT INTO public.products VALUES ('64303139-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303139', 'a1000025-0001-4000-8000-000000000001', 16400, '2.30ct Emerald G VS2', true, '2025-10-15 10:00:00+00', '2025-10-15 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('64303230-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303230', 'a1000025-0001-4000-8000-000000000001', 6950, '0.95ct Emerald F IF', true, '2025-10-15 10:05:00+00', '2025-10-15 10:05:00+00', NULL);
INSERT INTO public.products VALUES ('64303231-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303231', 'a1000025-0001-4000-8000-000000000001', 12800, '1.15ct Pear D VVS2', true, '2025-10-15 10:10:00+00', '2025-10-15 10:10:00+00', NULL);
INSERT INTO public.products VALUES ('64303232-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303232', 'a1000025-0001-4000-8000-000000000001', 32500, '2.75ct Pear F VS1', true, '2025-10-15 10:15:00+00', '2025-10-15 10:15:00+00', NULL);
INSERT INTO public.products VALUES ('64303233-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303233', 'a1000025-0001-4000-8000-000000000001', 2350, '0.72ct Pear G SI1', true, '2025-10-15 10:20:00+00', '2025-10-15 10:20:00+00', NULL);
INSERT INTO public.products VALUES ('64303234-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303234', 'a1000025-0001-4000-8000-000000000001', 9200, '1.05ct Marquise E VVS1', true, '2025-10-15 10:25:00+00', '2025-10-15 10:25:00+00', NULL);
INSERT INTO public.products VALUES ('64303235-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303235', 'a1000025-0001-4000-8000-000000000001', 14800, '1.82ct Marquise G VS1', true, '2025-10-15 10:30:00+00', '2025-10-15 10:30:00+00', NULL);
INSERT INTO public.products VALUES ('64303236-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303236', 'a1000025-0001-4000-8000-000000000001', 2780, '0.65ct Marquise F VS2', true, '2025-10-15 10:35:00+00', '2025-10-15 10:35:00+00', NULL);
INSERT INTO public.products VALUES ('64303237-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303237', 'a1000025-0001-4000-8000-000000000001', 11200, '1.42ct Princess E VS1', true, '2025-10-15 10:40:00+00', '2025-10-15 10:40:00+00', NULL);
INSERT INTO public.products VALUES ('64303238-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303238', 'a1000025-0001-4000-8000-000000000001', 13500, '2.05ct Princess H VVS2', true, '2025-10-15 10:45:00+00', '2025-10-15 10:45:00+00', NULL);
INSERT INTO public.products VALUES ('64303239-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303239', 'a1000025-0001-4000-8000-000000000001', 16500, '1.68ct Radiant F VVS1', true, '2025-10-15 10:50:00+00', '2025-10-15 10:50:00+00', NULL);
INSERT INTO public.products VALUES ('64303330-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303330', 'a1000025-0001-4000-8000-000000000001', 48500, '2.88ct Radiant D VS1', true, '2025-10-15 10:55:00+00', '2025-10-15 10:55:00+00', NULL);
INSERT INTO public.products VALUES ('64303331-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000001', '4e442d32-3530-332d-3130-303031303331', 'a1000025-0001-4000-8000-000000000001', 9800, '1.25ct Asscher E VVS2', true, '2025-10-15 11:00:00+00', '2025-10-15 11:00:00+00', NULL);
INSERT INTO public.products VALUES ('64303332-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000002', '4e442d32-3530-332d-3130-303031303332', 'a1000025-0001-4000-8000-000000000001', 15200, '2.15ct Asscher G VS1', true, '2025-10-15 11:05:00+00', '2025-10-15 11:05:00+00', NULL);
INSERT INTO public.products VALUES ('64303333-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000003', '4e442d32-3530-332d-3130-303031303333', 'a1000025-0001-4000-8000-000000000001', 12500, '1.10ct Heart D VVS1', true, '2025-10-15 11:10:00+00', '2025-10-15 11:10:00+00', NULL);
INSERT INTO public.products VALUES ('64303334-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000004', '4e442d32-3530-332d-3130-303031303334', 'a1000025-0001-4000-8000-000000000001', 16200, '1.95ct Heart F VS2', true, '2025-10-15 11:15:00+00', '2025-10-15 11:15:00+00', NULL);
INSERT INTO public.products VALUES ('64303335-2d61-3162-322d-633364342d65', 'b2000001-0001-4000-8000-000000000005', '4e442d32-3530-332d-3130-303031303335', 'a1000025-0001-4000-8000-000000000001', 2400, '0.85ct Heart H SI1', true, '2025-10-15 11:20:00+00', '2025-10-15 11:20:00+00', NULL);

-- Lab-grown diamonds (product_category_id = lab_grown_diamond)
INSERT INTO public.products VALUES ('6c673030-312d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c472d32-3530-332d-3130-303031303031', 'a1000025-0001-4000-8000-000000000002', 9380, '1.02ct Round D IF Excellent Cut', true, '2025-11-01 08:30:00+00', '2025-11-01 08:30:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-322d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c472d32-3530-332d-3130-303031303032', 'a1000025-0001-4000-8000-000000000002', 2450, '0.73ct Round E VVS1 Excellent Cut', true, '2025-11-01 08:35:00+00', '2025-11-01 08:35:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-332d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c472d32-3530-332d-3130-303031303033', 'a1000025-0001-4000-8000-000000000002', 14200, '2.05ct Round F VS1 Excellent Cut', true, '2025-11-01 08:40:00+00', '2025-11-01 08:40:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-342d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c472d32-3530-332d-3130-303031303034', 'a1000025-0001-4000-8000-000000000002', 7100, '1.51ct Round G VVS2 Very Good Cut', true, '2025-11-01 08:45:00+00', '2025-11-01 08:45:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-352d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c472d32-3530-332d-3130-303031303035', 'a1000025-0001-4000-8000-000000000002', 1420, '0.52ct Round D VS2 Excellent Cut', true, '2025-11-01 08:50:00+00', '2025-11-01 08:50:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-362d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c472d32-3530-332d-3130-303031303036', 'a1000025-0001-4000-8000-000000000002', 44750, '3.25ct Round E VS1 Excellent Cut', true, '2025-11-01 08:55:00+00', '2025-11-01 08:55:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-372d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c472d32-3530-332d-3130-303031303037', 'a1000025-0001-4000-8000-000000000002', 2980, '1.22ct Round H SI1 Very Good Cut', true, '2025-11-01 09:00:00+00', '2025-11-01 09:00:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-382d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c472d32-3530-332d-3130-303031303038', 'a1000025-0001-4000-8000-000000000002', 74250, '5.05ct Round D VVS1 Excellent Cut', true, '2025-11-01 09:05:00+00', '2025-11-01 09:05:00+00', NULL);
INSERT INTO public.products VALUES ('6c673030-392d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c472d32-3530-332d-3130-303031303039', 'a1000025-0001-4000-8000-000000000002', 8600, '1.55ct Oval D VVS2', true, '2025-11-01 09:10:00+00', '2025-11-01 09:10:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-302d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c472d32-3530-332d-3130-303031303130', 'a1000025-0001-4000-8000-000000000002', 12300, '2.12ct Oval F VS1', true, '2025-11-01 09:15:00+00', '2025-11-01 09:15:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-312d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c472d32-3530-332d-3130-303031303131', 'a1000025-0001-4000-8000-000000000002', 2100, '0.91ct Oval G VS2', true, '2025-11-01 09:20:00+00', '2025-11-01 09:20:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-322d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c472d32-3530-332d-3130-303031303132', 'a1000025-0001-4000-8000-000000000002', 11400, '1.78ct Oval E IF', true, '2025-11-01 09:25:00+00', '2025-11-01 09:25:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-332d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c472d32-3530-332d-3130-303031303133', 'a1000025-0001-4000-8000-000000000002', 5630, '1.32ct Cushion F VVS1', true, '2025-11-01 09:30:00+00', '2025-11-01 09:30:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-342d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c472d32-3530-332d-3130-303031303134', 'a1000025-0001-4000-8000-000000000002', 9450, '2.45ct Cushion G VS2', true, '2025-11-01 09:35:00+00', '2025-11-01 09:35:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-352d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c472d32-3530-332d-3130-303031303135', 'a1000025-0001-4000-8000-000000000002', 2330, '0.82ct Cushion D VS1', true, '2025-11-01 09:40:00+00', '2025-11-01 09:40:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-362d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c472d32-3530-332d-3130-303031303136', 'a1000025-0001-4000-8000-000000000002', 36400, '4.15ct Cushion E VVS2', true, '2025-11-01 09:45:00+00', '2025-11-01 09:45:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-372d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c472d32-3530-332d-3130-303031303137', 'a1000025-0001-4000-8000-000000000002', 7900, '1.58ct Emerald E VVS1', true, '2025-11-01 09:50:00+00', '2025-11-01 09:50:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-382d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c472d32-3530-332d-3130-303031303138', 'a1000025-0001-4000-8000-000000000002', 8200, '2.33ct Emerald G VS2', true, '2025-11-01 09:55:00+00', '2025-11-01 09:55:00+00', NULL);
INSERT INTO public.products VALUES ('6c673031-392d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c472d32-3530-332d-3130-303031303139', 'a1000025-0001-4000-8000-000000000002', 3480, '0.97ct Emerald F IF', true, '2025-11-01 10:00:00+00', '2025-11-01 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-302d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c472d32-3530-332d-3130-303031303230', 'a1000025-0001-4000-8000-000000000002', 6400, '1.18ct Pear D VVS2', true, '2025-11-01 10:05:00+00', '2025-11-01 10:05:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-312d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c472d32-3530-332d-3130-303031303231', 'a1000025-0001-4000-8000-000000000002', 16250, '2.78ct Pear F VS1', true, '2025-11-01 10:10:00+00', '2025-11-01 10:10:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-322d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c472d32-3530-332d-3130-303031303232', 'a1000025-0001-4000-8000-000000000002', 1180, '0.74ct Pear G SI1', true, '2025-11-01 10:15:00+00', '2025-11-01 10:15:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-332d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c472d32-3530-332d-3130-303031303233', 'a1000025-0001-4000-8000-000000000002', 4600, '1.08ct Marquise E VVS1', true, '2025-11-01 10:20:00+00', '2025-11-01 10:20:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-342d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c472d32-3530-332d-3130-303031303234', 'a1000025-0001-4000-8000-000000000002', 7400, '1.85ct Marquise G VS1', true, '2025-11-01 10:25:00+00', '2025-11-01 10:25:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-352d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c472d32-3530-332d-3130-303031303235', 'a1000025-0001-4000-8000-000000000002', 5600, '1.45ct Princess E VS1', true, '2025-11-01 10:30:00+00', '2025-11-01 10:30:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-362d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c472d32-3530-332d-3130-303031303236', 'a1000025-0001-4000-8000-000000000002', 6750, '2.08ct Princess H VVS2', true, '2025-11-01 10:35:00+00', '2025-11-01 10:35:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-372d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c472d32-3530-332d-3130-303031303237', 'a1000025-0001-4000-8000-000000000002', 8250, '1.70ct Radiant F VVS1', true, '2025-11-01 10:40:00+00', '2025-11-01 10:40:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-382d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c472d32-3530-332d-3130-303031303238', 'a1000025-0001-4000-8000-000000000002', 24250, '2.90ct Radiant D VS1', true, '2025-11-01 10:45:00+00', '2025-11-01 10:45:00+00', NULL);
INSERT INTO public.products VALUES ('6c673032-392d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c472d32-3530-332d-3130-303031303239', 'a1000025-0001-4000-8000-000000000002', 4900, '1.28ct Asscher E VVS2', true, '2025-11-01 10:50:00+00', '2025-11-01 10:50:00+00', NULL);
INSERT INTO public.products VALUES ('6c673033-302d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c472d32-3530-332d-3130-303031303330', 'a1000025-0001-4000-8000-000000000002', 6250, '1.12ct Heart D VVS1', true, '2025-11-01 10:55:00+00', '2025-11-01 10:55:00+00', NULL);

-- Gemstones (product_category_id = gemstone)
INSERT INTO public.products VALUES ('67733030-312d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '47532d32-3530-332d-3230-303031303031', 'a1000025-0001-4000-8000-000000000003', 68000, '2.15ct Oval Vivid Red Ruby — Myanmar, Unheated', true, '2025-12-01 08:30:00+00', '2025-12-01 08:30:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-322d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '47532d32-3530-332d-3230-303031303032', 'a1000025-0001-4000-8000-000000000003', 15200, '1.03ct Cushion Pigeon Blood Red Ruby — Mozambique, Heated', true, '2025-12-01 08:35:00+00', '2025-12-01 08:35:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-332d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '47532d32-3530-332d-3230-303031303033', 'a1000025-0001-4000-8000-000000000003', 78500, '3.87ct Pear Vivid Red Ruby — Myanmar, Unheated', true, '2025-12-01 08:40:00+00', '2025-12-01 08:40:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-342d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '47532d32-3530-332d-3230-303031303034', 'a1000025-0001-4000-8000-000000000003', 5400, '0.72ct Round Deep Red Ruby — Madagascar, Heated', true, '2025-12-01 08:45:00+00', '2025-12-01 08:45:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-352d-6232-6333-2d643465352d', 'b2000001-0001-4000-8000-000000000002', '47532d32-3530-332d-3230-303031303035', 'a1000025-0001-4000-8000-000000000003', 58000, '5.22ct Cushion Royal Blue Sapphire — Kashmir, Unheated', true, '2025-12-01 08:50:00+00', '2025-12-01 08:50:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-362d-6232-6333-2d643465352d', 'b2000001-0001-4000-8000-000000000003', '47532d32-3530-332d-3230-303031303036', 'a1000025-0001-4000-8000-000000000003', 24500, '2.04ct Oval Cornflower Blue Sapphire — Sri Lanka, Unheated', true, '2025-12-01 08:55:00+00', '2025-12-01 08:55:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-372d-6232-6333-2d643465352d', 'b2000001-0001-4000-8000-000000000004', '47532d32-3530-332d-3230-303031303037', 'a1000025-0001-4000-8000-000000000003', 6900, '1.38ct Round Vivid Blue Sapphire — Madagascar, Heated', true, '2025-12-01 09:00:00+00', '2025-12-01 09:00:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-382d-6232-6333-2d643465352d', 'b2000001-0001-4000-8000-000000000005', '47532d32-3530-332d-3230-303031303038', 'a1000025-0001-4000-8000-000000000003', 42000, '3.51ct Emerald-cut Padparadscha Sapphire — Sri Lanka, Unheated', true, '2025-12-01 09:05:00+00', '2025-12-01 09:05:00+00', NULL);
INSERT INTO public.products VALUES ('67733030-392d-6333-6434-2d653566362d', 'b2000001-0001-4000-8000-000000000001', '47532d32-3530-332d-3230-303031303039', 'a1000025-0001-4000-8000-000000000003', 38500, '2.78ct Emerald-cut Vivid Green Emerald — Colombia, Oiled', true, '2025-12-01 09:10:00+00', '2025-12-01 09:10:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-302d-6333-6434-2d653566362d', 'b2000001-0001-4000-8000-000000000002', '47532d32-3530-332d-3230-303031303130', 'a1000025-0001-4000-8000-000000000003', 12800, '1.52ct Oval Deep Green Emerald — Colombia, Oiled', true, '2025-12-01 09:15:00+00', '2025-12-01 09:15:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-312d-6333-6434-2d653566362d', 'b2000001-0001-4000-8000-000000000003', '47532d32-3530-332d-3230-303031303131', 'a1000025-0001-4000-8000-000000000003', 8200, '4.15ct Pear Medium Green Emerald — Brazil, None', true, '2025-12-01 09:20:00+00', '2025-12-01 09:20:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-322d-6434-6535-2d663661372d', 'b2000001-0001-4000-8000-000000000004', '47532d32-3530-332d-3230-303031303132', 'a1000025-0001-4000-8000-000000000003', 7800, '5.61ct Cushion Vivid Violet Blue Tanzanite — Tanzania, Heated', true, '2025-12-01 09:25:00+00', '2025-12-01 09:25:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-332d-6434-6535-2d663661372d', 'b2000001-0001-4000-8000-000000000005', '47532d32-3530-332d-3230-303031303133', 'a1000025-0001-4000-8000-000000000003', 2800, '2.34ct Oval Deep Blue Violet Tanzanite — Tanzania, Heated', true, '2025-12-01 09:30:00+00', '2025-12-01 09:30:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-342d-6434-6535-2d663661372d', 'b2000001-0001-4000-8000-000000000001', '47532d32-3530-332d-3230-303031303134', 'a1000025-0001-4000-8000-000000000003', 650, '1.08ct Round Medium Blue Violet Tanzanite — Tanzania, Heated', true, '2025-12-01 09:35:00+00', '2025-12-01 09:35:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-352d-6535-6636-2d613762382d', 'b2000001-0001-4000-8000-000000000002', '47532d32-3530-332d-3230-303031303135', 'a1000025-0001-4000-8000-000000000003', 42000, '1.42ct Cushion Green to Red Color Change Alexandrite — Brazil, None', true, '2025-12-01 09:40:00+00', '2025-12-01 09:40:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-362d-6535-6636-2d613762382d', 'b2000001-0001-4000-8000-000000000003', '47532d32-3530-332d-3230-303031303136', 'a1000025-0001-4000-8000-000000000003', 14500, '0.85ct Oval Teal to Purple Color Change Alexandrite — Sri Lanka, None', true, '2025-12-01 09:45:00+00', '2025-12-01 09:45:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-372d-6636-6137-2d623863392d', 'b2000001-0001-4000-8000-000000000004', '47532d32-3530-332d-3230-303031303137', 'a1000025-0001-4000-8000-000000000003', 2950, '8.45ct Emerald-cut Medium Blue Aquamarine — Brazil, Heated', true, '2025-12-01 09:50:00+00', '2025-12-01 09:50:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-382d-6636-6137-2d623863392d', 'b2000001-0001-4000-8000-000000000005', '47532d32-3530-332d-3230-303031303138', 'a1000025-0001-4000-8000-000000000003', 850, '3.21ct Oval Sky Blue Aquamarine — Madagascar, None', true, '2025-12-01 09:55:00+00', '2025-12-01 09:55:00+00', NULL);
INSERT INTO public.products VALUES ('67733031-392d-6636-6137-2d623863392d', 'b2000001-0001-4000-8000-000000000001', '47532d32-3530-332d-3230-303031303139', 'a1000025-0001-4000-8000-000000000003', 2200, '12.34ct Pear Deep Blue Aquamarine — Brazil, None', true, '2025-12-01 10:00:00+00', '2025-12-01 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-302d-6137-6238-2d633964302d', 'b2000001-0001-4000-8000-000000000002', '47532d32-3530-332d-3230-303031303230', 'a1000025-0001-4000-8000-000000000003', 1850, '6.72ct Cushion Peach Pink Morganite — Brazil, Heated', true, '2025-12-01 10:05:00+00', '2025-12-01 10:05:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-312d-6137-6238-2d633964302d', 'b2000001-0001-4000-8000-000000000003', '47532d32-3530-332d-3230-303031303231', 'a1000025-0001-4000-8000-000000000003', 1200, '3.45ct Oval Intense Pink Morganite — Madagascar, None', true, '2025-12-01 10:10:00+00', '2025-12-01 10:10:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-322d-6137-6238-2d633964302d', 'b2000001-0001-4000-8000-000000000004', '47532d32-3530-332d-3230-303031303232', 'a1000025-0001-4000-8000-000000000003', 1650, '9.88ct Heart Soft Rose Morganite — Brazil, Heated', true, '2025-12-01 10:15:00+00', '2025-12-01 10:15:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-332d-6238-6339-2d643065312d', 'b2000001-0001-4000-8000-000000000005', '47532d32-3530-332d-3230-303031303233', 'a1000025-0001-4000-8000-000000000003', 4800, '3.78ct Emerald-cut Neon Blue (Paraiba) Tourmaline — Brazil, Heated', true, '2025-12-01 10:20:00+00', '2025-12-01 10:20:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-342d-6238-6339-2d643065312d', 'b2000001-0001-4000-8000-000000000001', '47532d32-3530-332d-3230-303031303234', 'a1000025-0001-4000-8000-000000000003', 1500, '2.15ct Oval Vivid Green Tourmaline — Mozambique, None', true, '2025-12-01 10:25:00+00', '2025-12-01 10:25:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-352d-6238-6339-2d643065312d', 'b2000001-0001-4000-8000-000000000002', '47532d32-3530-332d-3230-303031303235', 'a1000025-0001-4000-8000-000000000003', 3200, '5.42ct Cabochon Hot Pink (Rubellite) Tourmaline — Madagascar, None', true, '2025-12-01 10:30:00+00', '2025-12-01 10:30:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-362d-6339-6430-2d653166322d', 'b2000001-0001-4000-8000-000000000003', '47532d32-3530-332d-3230-303031303236', 'a1000025-0001-4000-8000-000000000003', 9500, '2.88ct Cushion Vivid Pink Spinel — Myanmar, None', true, '2025-12-01 10:35:00+00', '2025-12-01 10:35:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-372d-6339-6430-2d653166322d', 'b2000001-0001-4000-8000-000000000004', '47532d32-3530-332d-3230-303031303237', 'a1000025-0001-4000-8000-000000000003', 7200, '1.56ct Oval Cobalt Blue Spinel — Sri Lanka, None', true, '2025-12-01 10:40:00+00', '2025-12-01 10:40:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-382d-6339-6430-2d653166322d', 'b2000001-0001-4000-8000-000000000005', '47532d32-3530-332d-3230-303031303238', 'a1000025-0001-4000-8000-000000000003', 5800, '4.12ct Round Flame Red Spinel — Tanzania, None', true, '2025-12-01 10:45:00+00', '2025-12-01 10:45:00+00', NULL);
INSERT INTO public.products VALUES ('67733032-392d-6430-6531-2d663261332d', 'b2000001-0001-4000-8000-000000000001', '47532d32-3530-332d-3230-303031303239', 'a1000025-0001-4000-8000-000000000003', 1800, '4.55ct Oval Mandarin Orange (Spessartite) Garnet — Madagascar, None', true, '2025-12-01 10:50:00+00', '2025-12-01 10:50:00+00', NULL);
INSERT INTO public.products VALUES ('67733033-302d-6430-6531-2d663261332d', 'b2000001-0001-4000-8000-000000000002', '47532d32-3530-332d-3230-303031303330', 'a1000025-0001-4000-8000-000000000003', 950, '7.22ct Cabochon Deep Raspberry (Rhodolite) Garnet — Tanzania, None', true, '2025-12-01 10:55:00+00', '2025-12-01 10:55:00+00', NULL);

-- Natural melee (product_category_id = natural_melee)
INSERT INTO public.products VALUES ('6e6d3030-312d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4e4d2d32-3530-332d-3330-303031303031', 'a1000025-0001-4000-8000-000000000004', 4800, 'Round 0.80-1.00mm D-F VVS-VS — 100pcs, 1.50ct', true, '2026-01-10 08:30:00+00', '2026-01-10 08:30:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-322d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4e4d2d32-3530-332d-3330-303031303032', 'a1000025-0001-4000-8000-000000000004', 1870, 'Round 1.00-1.15mm D-F VVS-VS — 50pcs, 0.55ct', true, '2026-01-10 08:35:00+00', '2026-01-10 08:35:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-332d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4e4d2d32-3530-332d-3330-303031303033', 'a1000025-0001-4000-8000-000000000004', 7040, 'Round 1.15-1.30mm G-H VVS-VS — 200pcs, 3.20ct', true, '2026-01-10 08:40:00+00', '2026-01-10 08:40:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-342d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4e4d2d32-3530-332d-3330-303031303034', 'a1000025-0001-4000-8000-000000000004', 5850, 'Round 1.30-1.50mm D-F VS-SI — 150pcs, 3.00ct', true, '2026-01-10 08:45:00+00', '2026-01-10 08:45:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-352d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4e4d2d32-3530-332d-3330-303031303035', 'a1000025-0001-4000-8000-000000000004', 3750, 'Round 1.50-1.70mm G-H VS-SI — 100pcs, 2.50ct', true, '2026-01-10 08:50:00+00', '2026-01-10 08:50:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-362d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4e4d2d32-3530-332d-3330-303031303036', 'a1000025-0001-4000-8000-000000000004', 2100, 'Round 1.70-2.00mm I-J VS-SI — 50pcs, 1.75ct', true, '2026-01-10 08:55:00+00', '2026-01-10 08:55:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-372d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4e4d2d32-3530-332d-3330-303031303037', 'a1000025-0001-4000-8000-000000000004', 4375, 'Round 2.00-2.50mm D-F VVS-VS — 25pcs, 1.25ct', true, '2026-01-10 09:00:00+00', '2026-01-10 09:00:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-382d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4e4d2d32-3530-332d-3330-303031303038', 'a1000025-0001-4000-8000-000000000004', 7200, 'Round 0.80-1.00mm G-H VVS-VS — 200pcs, 3.00ct', true, '2026-01-10 09:05:00+00', '2026-01-10 09:05:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3030-392d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4e4d2d32-3530-332d-3330-303031303039', 'a1000025-0001-4000-8000-000000000004', 1567.5, 'Round 1.00-1.15mm I-J SI — 150pcs, 1.65ct', true, '2026-01-10 09:10:00+00', '2026-01-10 09:10:00+00', NULL);
INSERT INTO public.products VALUES ('6e6d3031-302d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4e4d2d32-3530-332d-3330-303031303130', 'a1000025-0001-4000-8000-000000000004', 1040, 'Round 1.15-1.30mm K-L SI-I — 100pcs, 1.60ct', true, '2026-01-10 09:15:00+00', '2026-01-10 09:15:00+00', NULL);

-- Lab-grown melee (product_category_id = lab_grown_melee)
INSERT INTO public.products VALUES ('6c6d3030-312d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c4d2d32-3530-332d-3430-303031303031', 'a1000025-0001-4000-8000-000000000005', 2400, 'Round 0.80-1.00mm D-F VVS-VS — 100pcs, 1.50ct', true, '2026-01-15 08:30:00+00', '2026-01-15 08:30:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-322d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c4d2d32-3530-332d-3430-303031303032', 'a1000025-0001-4000-8000-000000000005', 935, 'Round 1.00-1.15mm D-F VVS-VS — 50pcs, 0.55ct', true, '2026-01-15 08:35:00+00', '2026-01-15 08:35:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-332d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c4d2d32-3530-332d-3430-303031303033', 'a1000025-0001-4000-8000-000000000005', 3520, 'Round 1.15-1.30mm G-H VVS-VS — 200pcs, 3.20ct', true, '2026-01-15 08:40:00+00', '2026-01-15 08:40:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-342d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c4d2d32-3530-332d-3430-303031303034', 'a1000025-0001-4000-8000-000000000005', 2925, 'Round 1.30-1.50mm D-F VS-SI — 150pcs, 3.00ct', true, '2026-01-15 08:45:00+00', '2026-01-15 08:45:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-352d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c4d2d32-3530-332d-3430-303031303035', 'a1000025-0001-4000-8000-000000000005', 1875, 'Round 1.50-1.70mm G-H VS-SI — 100pcs, 2.50ct', true, '2026-01-15 08:50:00+00', '2026-01-15 08:50:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-362d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000001', '4c4d2d32-3530-332d-3430-303031303036', 'a1000025-0001-4000-8000-000000000005', 1015, 'Round 1.70-2.00mm I-J VS-SI — 50pcs, 1.75ct', true, '2026-01-15 08:55:00+00', '2026-01-15 08:55:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-372d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000002', '4c4d2d32-3530-332d-3430-303031303037', 'a1000025-0001-4000-8000-000000000005', 2187.5, 'Round 2.00-2.50mm D-F VVS-VS — 25pcs, 1.25ct', true, '2026-01-15 09:00:00+00', '2026-01-15 09:00:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-382d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000003', '4c4d2d32-3530-332d-3430-303031303038', 'a1000025-0001-4000-8000-000000000005', 3600, 'Round 0.80-1.00mm G-H VVS-VS — 200pcs, 3.00ct', true, '2026-01-15 09:05:00+00', '2026-01-15 09:05:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3030-392d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000004', '4c4d2d32-3530-332d-3430-303031303039', 'a1000025-0001-4000-8000-000000000005', 783.75, 'Round 1.00-1.15mm I-J SI — 150pcs, 1.65ct', true, '2026-01-15 09:10:00+00', '2026-01-15 09:10:00+00', NULL);
INSERT INTO public.products VALUES ('6c6d3031-302d-6131-6232-2d633364342d', 'b2000001-0001-4000-8000-000000000005', '4c4d2d32-3530-332d-3430-303031303130', 'a1000025-0001-4000-8000-000000000005', 480, 'Round 1.15-1.30mm K-L SI-I — 100pcs, 1.60ct', true, '2026-01-15 09:15:00+00', '2026-01-15 09:15:00+00', NULL);

-- Jewelry (product_category_id = engagement_ring) — only 3 rings for brevity; price_usd = minimum config price
INSERT INTO public.products VALUES ('4d3af059-7d7a-4bfa-ad20-0182f7af941d', 'b2000001-0001-4000-8000-000000000005', '55582d32-3830-2d51-2d59-35412d524331', 'a1000025-0001-4000-8000-000000000006', 1850, 'Lumina Solitaire Engagement Ring', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('8c0fe92d-86ac-4942-81fb-0567e84b38bc', 'b2000001-0001-4000-8000-000000000005', '4b532d33-3430-2d51-2d4d-494c2d564c35', 'a1000025-0001-4000-8000-000000000006', 2100, 'Lorena Halo Engagement Ring', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('355b143f-f6f9-4947-b7ab-20b1ae4ee0f0', 'b2000001-0001-4000-8000-000000000005', '434a2d35-3836-2d54-2d4a-34572d384544', 'a1000025-0001-4000-8000-000000000006', 2450, 'Bellamy Pave Engagement Ring', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);

-- Wedding bands (product_category_id = wedding_band)
INSERT INTO public.products VALUES ('d2000000-0000-4000-8000-000000000001', 'b2000001-0001-4000-8000-000000000005', 'WB-2601-00000001', 'a1000025-0001-4000-8000-000000000007', 850, 'Classic Comfort Fit Wedding Band', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('d2000000-0000-4000-8000-000000000002', 'b2000001-0001-4000-8000-000000000005', 'WB-2601-00000002', 'a1000025-0001-4000-8000-000000000007', 1200, 'Milgrain Edge Wedding Band', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);

-- Tennis bracelets (product_category_id = tennis_bracelet)
INSERT INTO public.products VALUES ('d5000000-0000-4000-8000-000000000001', 'b2000001-0001-4000-8000-000000000005', 'TB-2601-00000001', 'a1000025-0001-4000-8000-000000000008', 3500, 'Classic Round Diamond Tennis Bracelet', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);
INSERT INTO public.products VALUES ('d5000000-0000-4000-8000-000000000002', 'b2000001-0001-4000-8000-000000000005', 'TB-2601-00000002', 'a1000025-0001-4000-8000-000000000008', 5200, 'Oval Cut Diamond Tennis Bracelet', true, '2026-02-20 10:00:00+00', '2026-02-20 10:00:00+00', NULL);


-- ============================================================================
-- 4. PRODUCT DETAILS: DIAMONDS
-- ============================================================================

--
-- Data for Name: diamonds; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, lab_grown, shape_id, carat, color_id, clarity_id, cut_id, polish_id, symmetry_id, fluorescence_id, price_per_carat_usd, table_pct, depth_pct, length_mm, width_mm, depth_mm
--

-- Natural diamonds (lab_grown = false)
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000001', '64303031-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 1.01, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000001', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 18564.36, 57, 61.5, 6.45, 6.48, 3.99);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000002', '64303032-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 0.71, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 6887.32, 56.5, 61.8, 5.72, 5.75, 3.54);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000003', '64303033-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 2.03, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000002', 13990.15, 57.5, 62.1, 8.12, 8.16, 5.05);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000004', '64303034-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 1.50, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 9466.67, 57, 61.2, 7.35, 7.38, 4.52);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000005', '64303035-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 0.50, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5700, 56, 60.8, 5.12, 5.15, 3.13);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000006', '64303036-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 3.21, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 27882.24, 57, 61.5, 9.45, 9.48, 5.83);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000007', '64303037-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 1.20, 'a1000002-0001-4000-8000-000000000005', 'a1000003-0001-4000-8000-000000000006', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000003', 4958.33, 56.5, 62.3, 6.82, 6.85, 4.26);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000008', '64303038-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000001', 5.02, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 29581.67, 57, 61.8, 11.05, 11.08, 6.85);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000009', '64303039-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000002', 1.52, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 11315.79, 58, 62.5, 8.55, 6.42, 4.01);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000010', '64303130-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000002', 2.10, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 11714.29, 58.5, 62.2, 9.72, 7.18, 4.47);

-- Lab-grown diamonds (lab_grown = true) — first 5 only for brevity
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000036', '6c673030-312d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 1.02, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000001', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 9196.08, 57, 61.5, 6.46, 6.49, 3.99);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000037', '6c673030-322d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 0.73, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 3356.16, 56.5, 61.8, 5.78, 5.81, 3.59);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000038', '6c673030-332d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 2.05, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000002', 6926.83, 57.5, 62.1, 8.14, 8.18, 5.07);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000039', '6c673030-342d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 1.51, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 4701.99, 57, 61.2, 7.36, 7.39, 4.53);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000040', '6c673030-352d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 0.52, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 2730.77, 56, 60.8, 5.15, 5.18, 3.15);

-- Remaining natural diamonds (11-35)
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000011', '64303131-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000002', 0.90, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 4666.67, 58, 62.5, 7.42, 5.56, 3.47);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000012', '64303132-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000002', 1.75, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000001', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 13028.57, 58.5, 62.2, 9.22, 6.88, 4.28);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000013', '64303133-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000002', 3.55, 'a1000002-0001-4000-8000-000000000005', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 11971.83, 58, 62.8, 11.15, 8.34, 5.24);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000014', '64303134-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000003', 1.30, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 8653.85, 57, 62.1, 6.72, 6.18, 3.84);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000015', '64303135-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000003', 2.41, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 7842.32, 57.5, 62.4, 7.88, 7.25, 4.52);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000016', '64303136-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000003', 0.80, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5812.50, 56.5, 61.8, 5.82, 5.35, 3.31);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000017', '64303137-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000003', 4.10, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 17756.10, 57, 62.5, 9.52, 8.75, 5.47);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000018', '64303138-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000004', 1.55, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 10193.55, 65, 62.8, 7.82, 5.65, 3.55);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000019', '64303139-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000004', 2.30, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 7130.43, 66, 63.1, 8.95, 6.48, 4.09);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000020', '64303230-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000004', 0.95, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000001', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 7315.79, 65, 62.5, 6.45, 4.68, 2.93);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000021', '64303231-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000005', 1.15, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 11130.43, 57, 61.8, 8.85, 5.82, 3.60);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000022', '64303232-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000005', 2.75, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000002', 11818.18, 57.5, 62.2, 11.45, 7.52, 4.68);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000023', '64303233-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000005', 0.72, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000006', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000003', 3263.89, 56, 61.5, 7.55, 4.92, 3.03);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000024', '64303234-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000006', 1.05, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 8761.90, 56, 61.2, 9.22, 4.82, 2.95);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000025', '64303235-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000006', 1.82, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 8131.87, 56.5, 61.8, 11.82, 6.15, 3.80);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000026', '64303236-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000006', 0.65, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000003', 4276.92, 55, 61.5, 8.22, 4.28, 2.63);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000027', '64303237-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000007', 1.42, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 7887.32, 73, 62.8, 6.05, 6.02, 3.79);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000028', '64303238-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000007', 2.05, 'a1000002-0001-4000-8000-000000000005', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 6585.37, 73.5, 63.1, 7.12, 7.08, 4.47);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000029', '64303239-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000008', 1.68, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 9821.43, 67, 62.5, 7.55, 6.92, 4.33);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000030', '64303330-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000008', 2.88, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 16840.28, 67.5, 62.8, 8.85, 8.12, 5.10);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000031', '64303331-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000009', 1.25, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 7840, 57, 62.1, 5.72, 5.68, 3.53);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000032', '64303332-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000009', 2.15, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 7069.77, 57.5, 62.5, 6.82, 6.78, 4.24);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000033', '64303333-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000010', 1.10, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 11363.64, 57, 61.8, 6.58, 6.55, 4.05);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000034', '64303334-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000010', 1.95, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 8307.69, 57.5, 62.2, 7.82, 7.78, 4.84);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000035', '64303335-2d61-3162-322d-633364342d65', false, 'a1000001-0001-4000-8000-000000000010', 0.85, 'a1000002-0001-4000-8000-000000000005', 'a1000003-0001-4000-8000-000000000006', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000003', 2823.53, 56.5, 61.5, 5.92, 5.88, 3.62);

-- Remaining lab-grown diamonds (6-30)
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000041', '6c673030-362d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 3.25, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 13769.23, 57, 61.5, 9.48, 9.51, 5.85);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000042', '6c673030-372d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 1.22, 'a1000002-0001-4000-8000-000000000005', 'a1000003-0001-4000-8000-000000000006', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000003', 2442.62, 56.5, 62.3, 6.85, 6.88, 4.29);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000043', '6c673030-382d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', 5.05, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 14702.97, 57, 61.8, 11.08, 11.11, 6.87);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000044', '6c673030-392d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000002', 1.55, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5548.39, 58, 62.5, 8.58, 6.45, 4.03);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000045', '6c673031-302d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000002', 2.12, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5801.89, 58.5, 62.2, 9.75, 7.20, 4.48);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000046', '6c673031-312d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000002', 0.91, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 2307.69, 58, 62.5, 7.45, 5.58, 3.49);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000047', '6c673031-322d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000002', 1.78, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000001', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 6404.49, 58.5, 62.2, 9.25, 6.92, 4.30);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000048', '6c673031-332d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000003', 1.32, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 4265.15, 57, 62.1, 6.75, 6.22, 3.86);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000049', '6c673031-342d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000003', 2.45, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 3857.14, 57.5, 62.4, 7.92, 7.28, 4.54);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000050', '6c673031-352d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000003', 0.82, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 2841.46, 56.5, 61.8, 5.85, 5.38, 3.32);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000051', '6c673031-362d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000003', 4.15, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 8771.08, 57, 62.5, 9.55, 8.78, 5.49);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000052', '6c673031-372d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000004', 1.58, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5000, 65, 62.8, 7.85, 5.68, 3.57);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000053', '6c673031-382d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000004', 2.33, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000005', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 3519.31, 66, 63.1, 8.98, 6.52, 4.11);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000054', '6c673031-392d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000004', 0.97, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000001', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 3587.63, 65, 62.5, 6.48, 4.70, 2.94);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000055', '6c673032-302d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000005', 1.18, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5423.73, 57, 61.8, 8.88, 5.85, 3.61);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000056', '6c673032-312d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000005', 2.78, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000002', 5845.32, 57.5, 62.2, 11.48, 7.55, 4.70);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000057', '6c673032-322d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000005', 0.74, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000006', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000003', 1594.59, 56, 61.5, 7.58, 4.95, 3.04);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000058', '6c673032-332d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000006', 1.08, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 4259.26, 56, 61.2, 9.25, 4.85, 2.97);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000059', '6c673032-342d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000006', 1.85, 'a1000002-0001-4000-8000-000000000004', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 4000, 56.5, 61.8, 11.85, 6.18, 3.82);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000060', '6c673032-352d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000007', 1.45, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 3862.07, 73, 62.8, 6.08, 6.05, 3.81);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000061', '6c673032-362d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000007', 2.08, 'a1000002-0001-4000-8000-000000000005', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000002', 'a1000005-0001-4000-8000-000000000002', 'a1000006-0001-4000-8000-000000000002', 'a1000007-0001-4000-8000-000000000002', 3245.19, 73.5, 63.1, 7.15, 7.11, 4.49);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000062', '6c673032-372d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000008', 1.70, 'a1000002-0001-4000-8000-000000000003', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 4852.94, 67, 62.5, 7.58, 6.95, 4.34);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000063', '6c673032-382d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000008', 2.90, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000004', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 8362.07, 67.5, 62.8, 8.88, 8.15, 5.12);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000064', '6c673032-392d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000009', 1.28, 'a1000002-0001-4000-8000-000000000002', 'a1000003-0001-4000-8000-000000000003', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 3828.13, 57, 62.1, 5.75, 5.71, 3.55);
INSERT INTO public.diamonds VALUES ('c1000001-0001-4000-8000-000000000065', '6c673033-302d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000010', 1.12, 'a1000002-0001-4000-8000-000000000001', 'a1000003-0001-4000-8000-000000000002', 'a1000004-0001-4000-8000-000000000001', 'a1000005-0001-4000-8000-000000000001', 'a1000006-0001-4000-8000-000000000001', 'a1000007-0001-4000-8000-000000000001', 5580.36, 57, 61.8, 6.62, 6.58, 4.07);

-- Remaining gemstones (11-30)
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000011', '67733031-312d-6333-6434-2d653566362d', 'a1000008-0001-4000-8000-000000000003', 'a1000001-0001-4000-8000-000000000005', 4.15, 'Medium Green', 'Included', 'a1000020-0001-4000-8000-000000000003', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000007', 1975.90, 12.05, 8.34, 5.88);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000012', '67733031-322d-6434-6535-2d663661372d', 'a1000008-0001-4000-8000-000000000004', 'a1000001-0001-4000-8000-000000000003', 5.61, 'Vivid Violet Blue', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000008', 1390.37, 10.82, 9.14, 6.75);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000013', '67733031-332d-6434-6535-2d663661372d', 'a1000008-0001-4000-8000-000000000004', 'a1000001-0001-4000-8000-000000000002', 2.34, 'Deep Blue Violet', 'Eye Clean', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000008', 1196.58, 8.92, 6.88, 4.82);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000014', '67733031-342d-6434-6535-2d663661372d', 'a1000008-0001-4000-8000-000000000004', 'a1000001-0001-4000-8000-000000000001', 1.08, 'Medium Blue Violet', 'Slightly Included', 'a1000020-0001-4000-8000-000000000003', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000008', 601.85, 6.42, 6.39, 4.15);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000015', '67733031-352d-6535-6636-2d613762382d', 'a1000008-0001-4000-8000-000000000005', 'a1000001-0001-4000-8000-000000000003', 1.42, 'Green to Red Color Change', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000007', 29577.46, 6.78, 5.92, 4.15);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000016', '67733031-362d-6535-6636-2d613762382d', 'a1000008-0001-4000-8000-000000000005', 'a1000001-0001-4000-8000-000000000002', 0.85, 'Teal to Purple Color Change', 'Slightly Included', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000005', 17058.82, 5.94, 4.82, 3.38);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000017', '67733031-372d-6636-6137-2d623863392d', 'a1000008-0001-4000-8000-000000000006', 'a1000001-0001-4000-8000-000000000011', 8.45, 'Medium Blue', 'Loupe Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000007', 349.11, 14.22, 10.05, 7.18);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000018', '67733031-382d-6636-6137-2d623863392d', 'a1000008-0001-4000-8000-000000000006', 'a1000001-0001-4000-8000-000000000002', 3.21, 'Sky Blue', 'Eye Clean', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000003', 264.80, 10.45, 8.12, 5.64);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000019', '67733031-392d-6636-6137-2d623863392d', 'a1000008-0001-4000-8000-000000000006', 'a1000001-0001-4000-8000-000000000005', 12.34, 'Deep Blue', 'Loupe Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000007', 178.28, 18.12, 12.05, 8.44);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000020', '67733032-302d-6137-6238-2d633964302d', 'a1000008-0001-4000-8000-000000000007', 'a1000001-0001-4000-8000-000000000003', 6.72, 'Peach Pink', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000007', 275.30, 12.15, 10.42, 7.28);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000021', '67733032-312d-6137-6238-2d633964302d', 'a1000008-0001-4000-8000-000000000007', 'a1000001-0001-4000-8000-000000000002', 3.45, 'Intense Pink', 'Loupe Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000003', 347.83, 10.82, 8.34, 5.92);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000022', '67733032-322d-6137-6238-2d633964302d', 'a1000008-0001-4000-8000-000000000007', 'a1000001-0001-4000-8000-000000000010', 9.88, 'Soft Rose', 'Eye Clean', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000007', 166.94, 14.55, 14.12, 9.02);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000023', '67733032-332d-6238-6339-2d643065312d', 'a1000008-0001-4000-8000-000000000008', 'a1000001-0001-4000-8000-000000000011', 3.78, 'Neon Blue (Paraiba)', 'Slightly Included', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000007', 1269.84, 10.22, 7.45, 5.32);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000024', '67733032-342d-6238-6339-2d643065312d', 'a1000008-0001-4000-8000-000000000008', 'a1000001-0001-4000-8000-000000000002', 2.15, 'Vivid Green', 'Eye Clean', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000002', 697.67, 8.92, 6.78, 4.82);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000025', '67733032-352d-6238-6339-2d643065312d', 'a1000008-0001-4000-8000-000000000008', 'a1000001-0001-4000-8000-000000000012', 5.42, 'Hot Pink (Rubellite)', 'Slightly Included', 'a1000020-0001-4000-8000-000000000003', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000003', 590.41, 11.45, 9.22, 6.55);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000026', '67733032-362d-6339-6430-2d653166322d', 'a1000008-0001-4000-8000-000000000009', 'a1000001-0001-4000-8000-000000000003', 2.88, 'Vivid Pink', 'Loupe Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000001', 3298.61, 8.52, 7.34, 5.18);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000027', '67733032-372d-6339-6430-2d653166322d', 'a1000008-0001-4000-8000-000000000009', 'a1000001-0001-4000-8000-000000000002', 1.56, 'Cobalt Blue', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000005', 4615.38, 7.22, 5.88, 4.05);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000028', '67733032-382d-6339-6430-2d653166322d', 'a1000008-0001-4000-8000-000000000009', 'a1000001-0001-4000-8000-000000000001', 4.12, 'Flame Red', 'Slightly Included', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000008', 1407.77, 9.34, 9.31, 6.12);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000029', '67733032-392d-6430-6531-2d663261332d', 'a1000008-0001-4000-8000-000000000010', 'a1000001-0001-4000-8000-000000000002', 4.55, 'Mandarin Orange (Spessartite)', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000003', 395.60, 10.88, 8.72, 6.15);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000030', '67733033-302d-6430-6531-2d663261332d', 'a1000008-0001-4000-8000-000000000010', 'a1000001-0001-4000-8000-000000000012', 7.22, 'Deep Raspberry (Rhodolite)', 'Slightly Included', 'a1000020-0001-4000-8000-000000000003', 'a1000009-0001-4000-8000-000000000004', 'a1000010-0001-4000-8000-000000000008', 131.58, 12.45, 10.34, 7.22);


-- ============================================================================
-- 4b. PRODUCT DETAILS: GEMSTONES
-- ============================================================================

--
-- Data for Name: gemstones; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, gemstone_type_id, shape_id, carat, color, clarity, cut_id (FK -> gemstone_cut_grades), treatment_id, origin_id, price_per_carat_usd, length_mm, width_mm, depth_mm
--

INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000001', '67733030-312d-6131-6232-2d633364342d', 'a1000008-0001-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000002', 2.15, 'Vivid Red', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000001', 'a1000010-0001-4000-8000-000000000001', 31627.91, 8.12, 6.34, 4.51);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000002', '67733030-322d-6131-6232-2d633364342d', 'a1000008-0001-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000003', 1.03, 'Pigeon Blood Red', 'Loupe Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000002', 14757.28, 6.01, 5.48, 3.72);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000003', '67733030-332d-6131-6232-2d633364342d', 'a1000008-0001-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000005', 3.87, 'Vivid Red', 'Slightly Included', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000001', 'a1000010-0001-4000-8000-000000000001', 20284, 10.45, 7.88, 5.21);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000004', '67733030-342d-6131-6232-2d633364342d', 'a1000008-0001-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000001', 0.72, 'Deep Red', 'Eye Clean', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000003', 7500, 5.61, 5.58, 3.45);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000005', '67733030-352d-6232-6333-2d643465352d', 'a1000008-0001-4000-8000-000000000002', 'a1000001-0001-4000-8000-000000000003', 5.22, 'Royal Blue', 'Loupe Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000001', 'a1000010-0001-4000-8000-000000000004', 11111.11, 10.15, 9.02, 6.18);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000006', '67733030-362d-6232-6333-2d643465352d', 'a1000008-0001-4000-8000-000000000002', 'a1000001-0001-4000-8000-000000000002', 2.04, 'Cornflower Blue', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000001', 'a1000010-0001-4000-8000-000000000005', 12009.80, 8.34, 6.72, 4.45);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000007', '67733030-372d-6232-6333-2d643465352d', 'a1000008-0001-4000-8000-000000000002', 'a1000001-0001-4000-8000-000000000001', 1.38, 'Vivid Blue', 'Slightly Included', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000002', 'a1000010-0001-4000-8000-000000000003', 5000, 6.82, 6.79, 4.21);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000008', '67733030-382d-6232-6333-2d643465352d', 'a1000008-0001-4000-8000-000000000002', 'a1000001-0001-4000-8000-000000000011', 3.51, 'Padparadscha', 'Eye Clean', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000001', 'a1000010-0001-4000-8000-000000000005', 11965.81, 9.62, 7.14, 5.03);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000009', '67733030-392d-6333-6434-2d653566362d', 'a1000008-0001-4000-8000-000000000003', 'a1000001-0001-4000-8000-000000000011', 2.78, 'Vivid Green', 'Slightly Included', 'a1000020-0001-4000-8000-000000000001', 'a1000009-0001-4000-8000-000000000003', 'a1000010-0001-4000-8000-000000000006', 13848.92, 9.24, 7.01, 5.12);
INSERT INTO public.gemstones VALUES ('c2000001-0001-4000-8000-000000000010', '67733031-302d-6333-6434-2d653566362d', 'a1000008-0001-4000-8000-000000000003', 'a1000001-0001-4000-8000-000000000002', 1.52, 'Deep Green', 'Slightly Included', 'a1000020-0001-4000-8000-000000000002', 'a1000009-0001-4000-8000-000000000003', 'a1000010-0001-4000-8000-000000000006', 8421.05, 7.88, 5.94, 4.32);


-- ============================================================================
-- 4c. PRODUCT DETAILS: MELEE LOTS
-- ============================================================================

--
-- Data for Name: melee_lots; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, lab_grown, shape_id, size_range, color_range, clarity_range, cut_id, quantity, total_carat_weight
--

-- Natural melee (lab_grown = false)
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000001', '6e6d3030-312d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '0.80-1.00mm', 'D-F', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 100, 1.5);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000002', '6e6d3030-322d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.00-1.15mm', 'D-F', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 50, 0.55);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000003', '6e6d3030-332d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.15-1.30mm', 'G-H', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 200, 3.2);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000004', '6e6d3030-342d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.30-1.50mm', 'D-F', 'VS-SI', 'a1000004-0001-4000-8000-000000000002', 150, 3);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000005', '6e6d3030-352d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.50-1.70mm', 'G-H', 'VS-SI', 'a1000004-0001-4000-8000-000000000001', 100, 2.5);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000006', '6e6d3030-362d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.70-2.00mm', 'I-J', 'VS-SI', 'a1000004-0001-4000-8000-000000000002', 50, 1.75);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000007', '6e6d3030-372d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '2.00-2.50mm', 'D-F', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 25, 1.25);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000008', '6e6d3030-382d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '0.80-1.00mm', 'G-H', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 200, 3);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000009', '6e6d3030-392d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.00-1.15mm', 'I-J', 'SI', 'a1000004-0001-4000-8000-000000000003', 150, 1.65);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000010', '6e6d3031-302d-6131-6232-2d633364342d', false, 'a1000001-0001-4000-8000-000000000001', '1.15-1.30mm', 'K-L', 'SI-I', 'a1000004-0001-4000-8000-000000000003', 100, 1.6);

-- Lab-grown melee (lab_grown = true)
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000026', '6c6d3030-312d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '0.80-1.00mm', 'D-F', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 100, 1.5);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000027', '6c6d3030-322d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.00-1.15mm', 'D-F', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 50, 0.55);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000028', '6c6d3030-332d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.15-1.30mm', 'G-H', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 200, 3.2);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000029', '6c6d3030-342d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.30-1.50mm', 'D-F', 'VS-SI', 'a1000004-0001-4000-8000-000000000002', 150, 3);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000030', '6c6d3030-352d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.50-1.70mm', 'G-H', 'VS-SI', 'a1000004-0001-4000-8000-000000000001', 100, 2.5);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000031', '6c6d3030-362d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.70-2.00mm', 'I-J', 'VS-SI', 'a1000004-0001-4000-8000-000000000002', 50, 1.75);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000032', '6c6d3030-372d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '2.00-2.50mm', 'D-F', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 25, 1.25);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000033', '6c6d3030-382d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '0.80-1.00mm', 'G-H', 'VVS-VS', 'a1000004-0001-4000-8000-000000000001', 200, 3);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000034', '6c6d3030-392d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.00-1.15mm', 'I-J', 'SI', 'a1000004-0001-4000-8000-000000000003', 150, 1.65);
INSERT INTO public.melee_lots VALUES ('c3000001-0001-4000-8000-000000000035', '6c6d3031-302d-6131-6232-2d633364342d', true, 'a1000001-0001-4000-8000-000000000001', '1.15-1.30mm', 'K-L', 'SI-I', 'a1000004-0001-4000-8000-000000000003', 100, 1.6);


-- ============================================================================
-- 5. JEWELRY
-- ============================================================================

--
-- Data for Name: engagement_rings; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, sku, band_style_id, ring_width_mm
--

INSERT INTO public.engagement_rings VALUES ('d1000000-0000-4000-8000-000000000001', '4d3af059-7d7a-4bfa-ad20-0182f7af941d', 'ENG-2512-57771366', 'a1000015-0001-4000-8000-000000000001', 1.6);
INSERT INTO public.engagement_rings VALUES ('d1000000-0000-4000-8000-000000000002', '8c0fe92d-86ac-4942-81fb-0567e84b38bc', 'ENG-2402-69520747', 'a1000015-0001-4000-8000-000000000002', 2.7);
INSERT INTO public.engagement_rings VALUES ('d1000000-0000-4000-8000-000000000003', '355b143f-f6f9-4947-b7ab-20b1ae4ee0f0', 'ENG-2508-54960704', 'a1000015-0001-4000-8000-000000000004', 2.2);


--
-- Data for Name: engagement_ring_available_metals; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, engagement_ring_id, metal_id, price_usd
--

INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000008', 2200);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000003', 1850);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000001', 1850);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000007', 2050);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000002', 'a1000026-0001-4000-8000-000000000008', 2500);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000006', 'd1000000-0000-4000-8000-000000000002', 'a1000026-0001-4000-8000-000000000003', 2100);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000007', 'd1000000-0000-4000-8000-000000000002', 'a1000026-0001-4000-8000-000000000002', 2300);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000008', 'd1000000-0000-4000-8000-000000000002', 'a1000026-0001-4000-8000-000000000007', 2300);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000009', 'd1000000-0000-4000-8000-000000000003', 'a1000026-0001-4000-8000-000000000008', 2800);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000010', 'd1000000-0000-4000-8000-000000000003', 'a1000026-0001-4000-8000-000000000003', 2450);
INSERT INTO public.engagement_ring_available_metals VALUES ('c6000000-0000-4000-8000-000000000011', 'd1000000-0000-4000-8000-000000000003', 'a1000026-0001-4000-8000-000000000007', 2650);


--
-- Data for Name: engagement_ring_compatible_stones; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, engagement_ring_id, shape_id, max_carat
--

INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000001', 2.0);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000002', 1.5);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000001', 'a1000001-0001-4000-8000-000000000003', 1.5);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000002', 'a1000001-0001-4000-8000-000000000001', 2.5);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000002', 'a1000001-0001-4000-8000-000000000005', 2.0);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000006', 'd1000000-0000-4000-8000-000000000003', 'a1000001-0001-4000-8000-000000000001', 3.0);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000007', 'd1000000-0000-4000-8000-000000000003', 'a1000001-0001-4000-8000-000000000002', 2.0);
INSERT INTO public.engagement_ring_compatible_stones VALUES ('c7000000-0000-4000-8000-000000000008', 'd1000000-0000-4000-8000-000000000003', 'a1000001-0001-4000-8000-000000000003', 2.0);


--
-- Data for Name: wedding_bands; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, sku, band_style_id, ring_width_mm
--

INSERT INTO public.wedding_bands VALUES ('d3000000-0000-4000-8000-000000000001', 'd2000000-0000-4000-8000-000000000001', 'WB-2601-00000001', 'a1000015-0001-4000-8000-000000000003', 2.0);
INSERT INTO public.wedding_bands VALUES ('d3000000-0000-4000-8000-000000000002', 'd2000000-0000-4000-8000-000000000002', 'WB-2601-00000002', 'a1000015-0001-4000-8000-000000000001', 3.0);


--
-- Data for Name: wedding_band_available_metals; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, wedding_band_id, metal_id, price_usd
--

INSERT INTO public.wedding_band_available_metals VALUES ('d4000000-0000-4000-8000-000000000001', 'd3000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000006', 850);
INSERT INTO public.wedding_band_available_metals VALUES ('d4000000-0000-4000-8000-000000000002', 'd3000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000001', 850);
INSERT INTO public.wedding_band_available_metals VALUES ('d4000000-0000-4000-8000-000000000003', 'd3000000-0000-4000-8000-000000000001', 'a1000026-0001-4000-8000-000000000008', 1100);
INSERT INTO public.wedding_band_available_metals VALUES ('d4000000-0000-4000-8000-000000000004', 'd3000000-0000-4000-8000-000000000002', 'a1000026-0001-4000-8000-000000000007', 1200);
INSERT INTO public.wedding_band_available_metals VALUES ('d4000000-0000-4000-8000-000000000005', 'd3000000-0000-4000-8000-000000000002', 'a1000026-0001-4000-8000-000000000008', 1500);


--
-- Data for Name: tennis_bracelets; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, sku
--

INSERT INTO public.tennis_bracelets VALUES ('d6000000-0000-4000-8000-000000000001', 'd5000000-0000-4000-8000-000000000001', 'TB-2601-00000001');
INSERT INTO public.tennis_bracelets VALUES ('d6000000-0000-4000-8000-000000000002', 'd5000000-0000-4000-8000-000000000002', 'TB-2601-00000002');


-- ============================================================================
-- 6. MEDIA: PRODUCT IMAGES & CERTIFICATIONS
-- ============================================================================

--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, url, sort_order, is_thumbnail (no image_type column)
--

INSERT INTO public.product_images VALUES ('d1000001-0001-4000-8000-000000000001', '64303031-2d61-3162-322d-633364342d65', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);
INSERT INTO public.product_images VALUES ('d1000001-0002-4000-8000-000000000002', '64303031-2d61-3162-322d-633364342d65', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_ANGLE.jpg', 1, false);
INSERT INTO public.product_images VALUES ('d1000001-0003-4000-8000-000000000003', '64303031-2d61-3162-322d-633364342d65', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FRONT.jpg', 2, false);
INSERT INTO public.product_images VALUES ('d1000002-0001-4000-8000-000000000004', '64303032-2d61-3162-322d-633364342d65', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);
INSERT INTO public.product_images VALUES ('d1000002-0002-4000-8000-000000000005', '64303032-2d61-3162-322d-633364342d65', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_ANGLE.jpg', 1, false);
INSERT INTO public.product_images VALUES ('d1000003-0001-4000-8000-000000000006', '64303033-2d61-3162-322d-633364342d65', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);
INSERT INTO public.product_images VALUES ('d1000004-0001-4000-8000-000000000007', '67733030-312d-6131-6232-2d633364342d', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);
INSERT INTO public.product_images VALUES ('d1000005-0001-4000-8000-000000000008', '6c673030-312d-6131-6232-2d633364342d', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);
INSERT INTO public.product_images VALUES ('d1000006-0001-4000-8000-000000000009', '6e6d3030-312d-6131-6232-2d633364342d', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);
INSERT INTO public.product_images VALUES ('d1000007-0001-4000-8000-000000000010', '6c6d3030-312d-6131-6232-2d633364342d', 'https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg', 0, true);


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, product_id, lab_id, certificate_number, pdf_url
--

INSERT INTO public.certifications VALUES ('d2000001-0001-4000-8000-000000000001', '64303031-2d61-3162-322d-633364342d65', 'a1000011-0001-4000-8000-000000000001', '2231546001', NULL);
INSERT INTO public.certifications VALUES ('d2000002-0001-4000-8000-000000000002', '64303032-2d61-3162-322d-633364342d65', 'a1000011-0001-4000-8000-000000000001', '2231546002', NULL);
INSERT INTO public.certifications VALUES ('d2000003-0001-4000-8000-000000000003', '64303033-2d61-3162-322d-633364342d65', 'a1000011-0001-4000-8000-000000000001', '6231546003', NULL);
INSERT INTO public.certifications VALUES ('d2000004-0001-4000-8000-000000000004', '64303034-2d61-3162-322d-633364342d65', 'a1000011-0001-4000-8000-000000000002', '4501234004', NULL);
INSERT INTO public.certifications VALUES ('d2000005-0001-4000-8000-000000000005', '64303035-2d61-3162-322d-633364342d65', 'a1000011-0001-4000-8000-000000000001', '2231546005', NULL);
INSERT INTO public.certifications VALUES ('d2000006-0001-4000-8000-000000000006', '67733030-312d-6131-6232-2d633364342d', 'a1000011-0001-4000-8000-000000000003', 'GRS2025-001', NULL);
INSERT INTO public.certifications VALUES ('d2000007-0001-4000-8000-000000000007', '67733030-352d-6232-6333-2d643465352d', 'a1000011-0001-4000-8000-000000000004', 'GUB2025-005', NULL);
INSERT INTO public.certifications VALUES ('d2000008-0001-4000-8000-000000000008', '6c673030-312d-6131-6232-2d633364342d', 'a1000011-0001-4000-8000-000000000002', '4501234036', NULL);
INSERT INTO public.certifications VALUES ('d2000009-0001-4000-8000-000000000009', '6c673030-322d-6131-6232-2d633364342d', 'a1000011-0001-4000-8000-000000000002', '4501234037', NULL);
INSERT INTO public.certifications VALUES ('d2000010-0001-4000-8000-000000000010', '6c673030-332d-6131-6232-2d633364342d', 'a1000011-0001-4000-8000-000000000002', '4501234038', NULL);


-- ============================================================================
-- 7. ORDER CHECKOUTS
-- ============================================================================

--
-- Data for Name: order_checkouts; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, user_id, payment_term_id, created_at
-- NOTE: order_number omitted (trigger assigns it); order_date and updated_at omitted
-- Grouped by user_id, ordered chronologically so triggers assign numbers correctly
--

-- User ...0001 (buyer 1)
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000006', 'b1000001-0001-4000-8000-000000000001', 'a1000024-0001-4000-8000-000000000003', '2025-03-01 10:00:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000001', 'a1000024-0001-4000-8000-000000000003', '2025-03-18 11:00:00+00');

-- User ...0002 (buyer 2)
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000005', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000002', '2025-03-05 09:30:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000008', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000004', '2025-03-10 08:45:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000004', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000001', '2025-03-10 16:12:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-20 14:22:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000007', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-20 17:30:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000002', '2025-03-24 13:32:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000010', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-25 10:00:00+00');

-- User ...0003 (buyer 3)
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at) VALUES ('c1000010-0001-4000-8000-000000000009', 'b1000001-0001-4000-8000-000000000003', 'a1000024-0001-4000-8000-000000000003', '2025-03-18 09:15:00+00');


-- ============================================================================
-- 8. ORDERS
-- ============================================================================

--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at
-- NOTE: order_number omitted (trigger assigns it); deleted_at omitted
--

INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3100-0000-000000000000', 'c1000010-0001-4000-8000-000000000001', 'a1000024-0001-4000-8000-000000000002', '2025-04-02', 'b3000001-0001-4000-8000-000000000002', 50, 595.17, 3571.04, false, false, '2025-03-24 13:32:00+00', '2025-03-24 13:32:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3200-0000-000000000000', 'c1000010-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-30', 'b3000001-0001-4000-8000-000000000002', 50, 478, 2868, true, true, '2025-03-20 14:22:00+00', '2025-03-22 09:15:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3300-0000-000000000000', 'c1000010-0001-4000-8000-000000000003', 'a1000024-0001-4000-8000-000000000003', '2025-03-28', 'b3000001-0001-4000-8000-000000000001', 75, 1705, 10230, true, false, '2025-03-18 11:00:00+00', '2025-03-22 16:45:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3400-0000-000000000000', 'c1000010-0001-4000-8000-000000000004', 'a1000024-0001-4000-8000-000000000001', '2025-03-24', 'b3000001-0001-4000-8000-000000000002', 50, 595.17, 3571.04, false, false, '2025-03-10 16:12:00+00', '2025-03-18 11:20:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3500-0000-000000000000', 'c1000010-0001-4000-8000-000000000005', 'a1000024-0001-4000-8000-000000000002', '2025-03-20', 'b3000001-0001-4000-8000-000000000002', 50, 650, 3900, false, false, '2025-03-05 09:30:00+00', '2025-03-20 10:00:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3600-0000-000000000000', 'c1000010-0001-4000-8000-000000000006', 'a1000024-0001-4000-8000-000000000003', '2025-03-20', 'b3000001-0001-4000-8000-000000000001', 75, 1135, 6810, false, false, '2025-03-01 10:00:00+00', '2025-03-08 14:20:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3700-0000-000000000000', 'c1000010-0001-4000-8000-000000000007', 'a1000024-0001-4000-8000-000000000003', '2025-12-31', 'b3000001-0001-4000-8000-000000000002', 0, 0, 0, false, false, '2025-03-20 17:30:00+00', '2025-03-21 09:00:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3030-3800-0000-000000000000', 'c1000010-0001-4000-8000-000000000008', 'a1000024-0001-4000-8000-000000000004', '2025-03-30', 'b3000001-0001-4000-8000-000000000002', 50, 478, 2868, false, false, '2025-03-10 08:45:00+00', '2025-03-20 11:00:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3031-3000-0000-000000000000', 'c1000010-0001-4000-8000-000000000009', 'a1000024-0001-4000-8000-000000000003', '2025-04-05', 'b3000001-0001-4000-8000-000000000003', 100, 7670, 45890, true, false, '2025-03-18 09:15:00+00', '2025-03-20 11:00:00+00');
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at) VALUES ('6f72642d-3031-3100-0000-000000000000', 'c1000010-0001-4000-8000-000000000010', 'a1000024-0001-4000-8000-000000000003', '2025-04-10', 'b3000001-0001-4000-8000-000000000002', 75, 1250, 7500, false, false, '2025-03-25 10:00:00+00', '2025-03-25 10:00:00+00');


-- ============================================================================
-- 9. ORDER CHILDREN: order_products, order_events, order_exchange_rates
-- ============================================================================

--
-- Data for Name: order_products; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, order_id, product_id, snapshot, price_usd
--

INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000001', '6f72642d-3030-3100-0000-000000000000', '64303031-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "1.01ct Round D IF", "subtitle": "GIA Certified", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "carat": 1.01, "color": "D", "clarity": "IF", "cut": "Excellent", "lab": "GIA", "certificate": "2231546001"}', 18750);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000002', '6f72642d-3030-3200-0000-000000000000', '67733030-312d-6131-6232-2d633364342d', '{"productType": "gemstone", "description": "2.15ct Oval Vivid Red Ruby", "subtitle": "Myanmar, Unheated", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "type": "Ruby", "shape": "Oval", "carat": 2.15, "color": "Vivid Red", "origin": "Myanmar", "treatment": "Unheated"}', 68000);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000003', '6f72642d-3030-3300-0000-000000000000', '64303033-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "2.03ct Round F VS1", "subtitle": "GIA Certified", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "carat": 2.03, "color": "F", "clarity": "VS1", "cut": "Excellent", "lab": "GIA", "certificate": "6231546003"}', 28400);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000004', '6f72642d-3030-3400-0000-000000000000', '64303035-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "0.50ct Round D VS2", "subtitle": "GIA Certified", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "carat": 0.50, "color": "D", "clarity": "VS2", "cut": "Excellent", "lab": "GIA", "certificate": "2231546005"}', 2850);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000005', '6f72642d-3030-3500-0000-000000000000', '6e6d3030-312d-6131-6232-2d633364342d', '{"productType": "natural_melee", "description": "Round 0.80-1.00mm D-F VVS-VS", "subtitle": "100pcs, 1.50ct", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "size_range": "0.80-1.00mm", "color_range": "D-F", "clarity_range": "VVS-VS", "quantity": 100, "total_carat": 1.50}', 4800);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000006', '6f72642d-3030-3600-0000-000000000000', '64303036-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "3.21ct Round E VS1", "subtitle": "GIA Certified", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "carat": 3.21, "color": "E", "clarity": "VS1", "cut": "Excellent", "lab": "GIA", "certificate": "2231546006"}', 89500);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000007', '6f72642d-3030-3700-0000-000000000000', '64303037-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "1.20ct Round H SI1", "subtitle": "Very Good Cut", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "carat": 1.20, "color": "H", "clarity": "SI1", "cut": "Very Good"}', 5950);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000008', '6f72642d-3030-3800-0000-000000000000', '67733030-362d-6232-6333-2d643465352d', '{"productType": "gemstone", "description": "2.04ct Oval Cornflower Blue Sapphire", "subtitle": "Sri Lanka, Unheated", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "type": "Sapphire", "shape": "Oval", "carat": 2.04, "color": "Cornflower Blue", "origin": "Sri Lanka", "treatment": "Unheated"}', 24500);
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000009', '6f72642d-3031-3000-0000-000000000000', '64303038-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "5.02ct Round D VVS1", "subtitle": "GIA Certified", "image": "https://s3.eu-west-2.amazonaws.com/nivoda.jewellery.catalog.media/31-RC12182EVR-E_FLAT.jpg", "shape": "Round", "carat": 5.02, "color": "D", "clarity": "VVS1", "cut": "Excellent", "lab": "GIA", "certificate": "2231546008"}', 148500);

-- Mount component for engagement ring order
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000010', '6f72642d-3031-3100-0000-000000000000', '4d3af059-7d7a-4bfa-ad20-0182f7af941d', '{"productType": "engagement_ring", "description": "Solitaire Engagement Ring", "subtitle": "14K White Gold, Cathedral Setting", "image": "https://nivodabackend.s3.amazonaws.com/engagement-ring-1.webp", "metalType": "White Gold", "metalColor": "White", "metalQuality": "14K", "bandStyle": "Cathedral", "ringSize": "6.5"}', 2500);

-- Stone component for engagement ring order
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000011', '6f72642d-3031-3100-0000-000000000000', '64303031-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "1.01ct Round D IF", "subtitle": "GIA Certified", "image": "https://nivodabackend.s3.amazonaws.com/diamond-1.webp", "shape": "Round", "carat": 1.01, "color": "D", "clarity": "IF", "cut": "Excellent", "polish": "Excellent", "symmetry": "Excellent", "fluorescence": "None", "lab": "GIA", "certificate": "2231546001", "measurements": "6.45 x 6.47 x 3.98mm", "table": "57%", "depth": "61.6%"}', 5000);


--
-- Data for Name: order_events; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, order_id, event_type_id, occurred_at
-- NOTE: trigger trg_order_event_status will auto-update orders.current_status
--

-- Order 1 (requested)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000001', '6f72642d-3030-3100-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-24 13:32:00+00');

-- Order 2 (confirmed)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000002', '6f72642d-3030-3200-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-20 14:22:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000003', '6f72642d-3030-3200-0000-000000000000', 'a1000021-0001-4000-8000-000000000002', '2025-03-22 09:15:00+00');

-- Order 3 (shipped)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000004', '6f72642d-3030-3300-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-18 11:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000005', '6f72642d-3030-3300-0000-000000000000', 'a1000021-0001-4000-8000-000000000002', '2025-03-19 10:30:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000006', '6f72642d-3030-3300-0000-000000000000', 'a1000021-0001-4000-8000-000000000004', '2025-03-22 16:45:00+00');

-- Order 4 (delivered)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000007', '6f72642d-3030-3400-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-10 16:12:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000008', '6f72642d-3030-3400-0000-000000000000', 'a1000021-0001-4000-8000-000000000002', '2025-03-11 09:45:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000009', '6f72642d-3030-3400-0000-000000000000', 'a1000021-0001-4000-8000-000000000004', '2025-03-14 15:30:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000010', '6f72642d-3030-3400-0000-000000000000', 'a1000021-0001-4000-8000-000000000005', '2025-03-18 08:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000011', '6f72642d-3030-3400-0000-000000000000', 'a1000021-0001-4000-8000-000000000006', '2025-03-18 11:20:00+00');

-- Order 5 (returned)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000012', '6f72642d-3030-3500-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-05 09:30:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000013', '6f72642d-3030-3500-0000-000000000000', 'a1000021-0001-4000-8000-000000000006', '2025-03-10 11:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000014', '6f72642d-3030-3500-0000-000000000000', 'a1000021-0001-4000-8000-000000000007', '2025-03-20 10:00:00+00');

-- Order 6 (delivered)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000015', '6f72642d-3030-3600-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-01 10:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000016', '6f72642d-3030-3600-0000-000000000000', 'a1000021-0001-4000-8000-000000000006', '2025-03-08 14:20:00+00');

-- Order 7 (cancelled)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000017', '6f72642d-3030-3700-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-20 17:30:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000018', '6f72642d-3030-3700-0000-000000000000', 'a1000021-0001-4000-8000-000000000008', '2025-03-21 09:00:00+00');

-- Order 8 (delayed)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000019', '6f72642d-3030-3800-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-10 08:45:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000020', '6f72642d-3030-3800-0000-000000000000', 'a1000021-0001-4000-8000-000000000004', '2025-03-14 16:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000021', '6f72642d-3030-3800-0000-000000000000', 'a1000021-0001-4000-8000-000000000009', '2025-03-20 11:00:00+00');

-- Order 9 (confirmed)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000022', '6f72642d-3031-3000-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-18 09:15:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000023', '6f72642d-3031-3000-0000-000000000000', 'a1000021-0001-4000-8000-000000000002', '2025-03-20 11:00:00+00');

-- Order 10 (engagement ring — requested, then confirmed)
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000024', '6f72642d-3031-3100-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-25 10:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000025', '6f72642d-3031-3100-0000-000000000000', 'a1000021-0001-4000-8000-000000000002', '2025-03-25 14:30:00+00');


--
-- Data for Name: order_exchange_rates; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, order_id, currency_id, rate
--

INSERT INTO public.order_exchange_rates VALUES ('c2000030-0001-4000-8000-000000000001', '6f72642d-3030-3100-0000-000000000000', 'a1000019-0001-4000-8000-000000000002', 0.93);
INSERT INTO public.order_exchange_rates VALUES ('c2000030-0001-4000-8000-000000000002', '6f72642d-3030-3100-0000-000000000000', 'a1000019-0001-4000-8000-000000000003', 0.79);
INSERT INTO public.order_exchange_rates VALUES ('c2000030-0001-4000-8000-000000000003', '6f72642d-3030-3200-0000-000000000000', 'a1000019-0001-4000-8000-000000000002', 0.93);
INSERT INTO public.order_exchange_rates VALUES ('c2000030-0001-4000-8000-000000000004', '6f72642d-3030-3200-0000-000000000000', 'a1000019-0001-4000-8000-000000000003', 0.79);
INSERT INTO public.order_exchange_rates VALUES ('c2000030-0001-4000-8000-000000000005', '6f72642d-3030-3300-0000-000000000000', 'a1000019-0001-4000-8000-000000000002', 0.93);
INSERT INTO public.order_exchange_rates VALUES ('c2000030-0001-4000-8000-000000000006', '6f72642d-3030-3300-0000-000000000000', 'a1000019-0001-4000-8000-000000000003', 0.79);


-- ============================================================================
-- 10. INVOICES
-- ============================================================================

--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, user_id, invoice_number, payment_method_id, issue_date, due_date, total_amount_usd, current_status (set by trigger), created_at, updated_at
--

INSERT INTO public.invoices VALUES ('e6000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000002', 'INV-2025-0001', 'a1000017-0001-4000-8000-000000000001', '2025-03-25', '2025-04-25', 3571.04, NULL, '2025-03-25 00:00:00+00', '2025-03-25 00:00:00+00');
INSERT INTO public.invoices VALUES ('e6000001-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000002', 'INV-2025-0002', 'a1000017-0001-4000-8000-000000000001', '2025-03-22', '2025-04-22', 2868, NULL, '2025-03-22 00:00:00+00', '2025-03-22 00:00:00+00');
INSERT INTO public.invoices VALUES ('e6000001-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000001', 'INV-2025-0003', 'a1000017-0001-4000-8000-000000000001', '2025-03-19', '2025-04-19', 10230, NULL, '2025-03-19 00:00:00+00', '2025-03-19 00:00:00+00');
INSERT INTO public.invoices VALUES ('e6000001-0001-4000-8000-000000000004', 'b1000001-0001-4000-8000-000000000002', 'INV-2025-0004', 'a1000017-0001-4000-8000-000000000002', '2025-03-11', '2025-03-25', 3571.04, NULL, '2025-03-11 00:00:00+00', '2025-03-11 00:00:00+00');
INSERT INTO public.invoices VALUES ('e6000001-0001-4000-8000-000000000005', 'b1000001-0001-4000-8000-000000000001', 'INV-2025-0005', 'a1000017-0001-4000-8000-000000000003', '2025-03-02', '2025-03-16', 6810, NULL, '2025-03-02 00:00:00+00', '2025-03-02 00:00:00+00');
INSERT INTO public.invoices VALUES ('e6000001-0001-4000-8000-000000000006', 'b1000001-0001-4000-8000-000000000003', 'INV-2025-0006', 'a1000017-0001-4000-8000-000000000003', '2025-03-20', '2025-04-20', 45890, NULL, '2025-03-20 00:00:00+00', '2025-03-20 00:00:00+00');


-- ============================================================================
-- 11. LEDGER ENTRIES & EXCHANGE RATES
-- ============================================================================

--
-- Data for Name: ledger_entries; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, invoice_id, ledger_entry_type_id, order_id, description, amount_usd, occurred_at
-- NOTE: trigger trg_ledger_entry_status will auto-update invoices.current_status
--

-- Invoice 1: order charge only (issued)
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000001', 'e6000001-0001-4000-8000-000000000001', 'a1000023-0001-4000-8000-000000000001', '6f72642d-3030-3100-0000-000000000000', 'Order 0001-1 charge', 3571.04, '2025-03-25 00:00:00+00');

-- Invoice 2: order charge + partial payment (partially_paid)
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000002', 'e6000001-0001-4000-8000-000000000002', 'a1000023-0001-4000-8000-000000000001', '6f72642d-3030-3200-0000-000000000000', 'Order 0002-1 charge', 2868, '2025-03-22 00:00:00+00');
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000003', 'e6000001-0001-4000-8000-000000000002', 'a1000023-0001-4000-8000-000000000002', NULL, 'Partial payment received', 1500, '2025-03-28 10:00:00+00');

-- Invoice 3: order charge + full payment (paid)
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000004', 'e6000001-0001-4000-8000-000000000003', 'a1000023-0001-4000-8000-000000000001', '6f72642d-3030-3300-0000-000000000000', 'Order 0003-1 charge', 10230, '2025-03-19 00:00:00+00');
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000005', 'e6000001-0001-4000-8000-000000000003', 'a1000023-0001-4000-8000-000000000002', NULL, 'Wire transfer payment received', 10230, '2025-03-25 14:00:00+00');

-- Invoice 4: order charge + full payment (paid)
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000006', 'e6000001-0001-4000-8000-000000000004', 'a1000023-0001-4000-8000-000000000001', '6f72642d-3030-3400-0000-000000000000', 'Order 0004-1 charge', 3571.04, '2025-03-11 00:00:00+00');
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000007', 'e6000001-0001-4000-8000-000000000004', 'a1000023-0001-4000-8000-000000000002', NULL, 'Credit card payment', 3571.04, '2025-03-11 12:00:00+00');

-- Invoice 5: order charge + full payment (paid)
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000008', 'e6000001-0001-4000-8000-000000000005', 'a1000023-0001-4000-8000-000000000001', '6f72642d-3030-3600-0000-000000000000', 'Order 0006-1 charge', 6810, '2025-03-02 00:00:00+00');
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000009', 'e6000001-0001-4000-8000-000000000005', 'a1000023-0001-4000-8000-000000000002', NULL, 'Wire transfer payment received', 6810, '2025-03-05 10:00:00+00');

-- Invoice 6: order charge only (issued)
INSERT INTO public.ledger_entries VALUES ('c3000010-0001-4000-8000-000000000010', 'e6000001-0001-4000-8000-000000000006', 'a1000023-0001-4000-8000-000000000001', '6f72642d-3031-3000-0000-000000000000', 'Order 0009-1 charge', 45890, '2025-03-20 00:00:00+00');


--
-- Data for Name: ledger_entry_exchange_rates; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, ledger_entry_id, currency_id, rate
--

INSERT INTO public.ledger_entry_exchange_rates VALUES ('c3000020-0001-4000-8000-000000000001', 'c3000010-0001-4000-8000-000000000003', 'a1000019-0001-4000-8000-000000000002', 0.93);
INSERT INTO public.ledger_entry_exchange_rates VALUES ('c3000020-0001-4000-8000-000000000002', 'c3000010-0001-4000-8000-000000000003', 'a1000019-0001-4000-8000-000000000003', 0.79);
INSERT INTO public.ledger_entry_exchange_rates VALUES ('c3000020-0001-4000-8000-000000000003', 'c3000010-0001-4000-8000-000000000005', 'a1000019-0001-4000-8000-000000000002', 0.92);
INSERT INTO public.ledger_entry_exchange_rates VALUES ('c3000020-0001-4000-8000-000000000004', 'c3000010-0001-4000-8000-000000000005', 'a1000019-0001-4000-8000-000000000003', 0.78);


-- ============================================================================
-- 12. COMMERCE: CART ITEMS, CART ITEM CONFIG, SHORTLISTS, SHORTLIST ITEMS
-- ============================================================================

--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, user_id, product_id, quantity, added_at
-- NOTE: user_id directly (no cart_id)
--

INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', '64303031-2d61-3162-322d-633364342d65', 1, '2026-03-18 14:30:00+00');
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000001', '67733030-312d-6131-6232-2d633364342d', 1, '2026-03-18 14:32:00+00');
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000002', '6c673030-312d-6131-6232-2d633364342d', 1, '2026-03-19 08:00:00+00');
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000004', 'b1000001-0001-4000-8000-000000000002', '6e6d3030-312d-6131-6232-2d633364342d', 2, '2026-03-19 08:10:00+00');
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000005', 'b1000001-0001-4000-8000-000000000002', '64303035-2d61-3162-322d-633364342d65', 1, '2026-03-19 08:15:00+00');
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000006', 'b1000001-0001-4000-8000-000000000003', '64303130-2d61-3162-322d-633364342d65', 1, '2026-03-20 10:30:00+00');
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000007', 'b1000001-0001-4000-8000-000000000003', '67733030-352d-6232-6333-2d643465352d', 1, '2026-03-20 10:45:00+00');
-- Jewelry cart item with configuration
INSERT INTO public.cart_items VALUES ('f2000001-0001-4000-8000-000000000008', 'b1000001-0001-4000-8000-000000000001', '4d3af059-7d7a-4bfa-ad20-0182f7af941d', 1, '2026-03-20 11:00:00+00');


--
-- Data for Name: cart_item_config; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, cart_item_id, metal_id, center_stone_product_id, ring_size, bracelet_length, engraving_text
--

INSERT INTO public.cart_item_config VALUES ('f2100001-0001-4000-8000-000000000001', 'f2000001-0001-4000-8000-000000000008', 'a1000026-0001-4000-8000-000000000008', '64303031-2d61-3162-322d-633364342d65', 6.5, NULL, NULL);


--
-- Data for Name: shortlists; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, user_id, name, created_at, updated_at
--

INSERT INTO public.shortlists VALUES ('f4000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', 'Favourites', '2026-02-10 09:00:00+00', '2026-03-01 14:20:00+00');
INSERT INTO public.shortlists VALUES ('f4000001-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000002', 'My Shortlist', '2026-02-18 10:00:00+00', '2026-03-05 16:00:00+00');
INSERT INTO public.shortlists VALUES ('f4000001-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000003', 'Investment Stones', '2026-03-05 08:00:00+00', '2026-03-10 11:15:00+00');


--
-- Data for Name: shortlist_items; Type: TABLE DATA; Schema: public; Owner: -
-- Columns: id, shortlist_id, product_id, added_at
--

INSERT INTO public.shortlist_items VALUES ('f3000001-0001-4000-8000-000000000001', 'f4000001-0001-4000-8000-000000000001', '64303033-2d61-3162-322d-633364342d65', '2026-02-15 10:00:00+00');
INSERT INTO public.shortlist_items VALUES ('f3000001-0001-4000-8000-000000000002', 'f4000001-0001-4000-8000-000000000001', '67733031-302d-6333-6434-2d653566362d', '2026-03-01 14:20:00+00');
INSERT INTO public.shortlist_items VALUES ('f3000001-0001-4000-8000-000000000003', 'f4000001-0001-4000-8000-000000000002', '6c673030-352d-6131-6232-2d633364342d', '2026-02-20 09:30:00+00');
INSERT INTO public.shortlist_items VALUES ('f3000001-0001-4000-8000-000000000004', 'f4000001-0001-4000-8000-000000000002', '64303135-2d61-3162-322d-633364342d65', '2026-03-05 16:00:00+00');
INSERT INTO public.shortlist_items VALUES ('f3000001-0001-4000-8000-000000000005', 'f4000001-0001-4000-8000-000000000003', '64303230-2d61-3162-322d-633364342d65', '2026-03-10 11:15:00+00');


--
-- PostgreSQL database dump complete
--
