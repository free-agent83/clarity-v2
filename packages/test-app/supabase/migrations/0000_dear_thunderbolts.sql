CREATE TABLE "band_styles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification_labs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_clarity_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_colors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_cut_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_fluorescence_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_polish_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_symmetry_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gemstone_cut_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gemstone_origins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gemstone_treatments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gemstone_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entry_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_event_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shapes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"state" text,
	"postal_code" text,
	"country_id" uuid NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"country_id" uuid NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"company_name" text,
	"phone" text,
	"verified" boolean DEFAULT false NOT NULL,
	"currency_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "diamonds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"lab_grown" boolean NOT NULL,
	"shape_id" uuid NOT NULL,
	"carat" numeric NOT NULL,
	"color_id" uuid NOT NULL,
	"clarity_id" uuid NOT NULL,
	"cut_id" uuid NOT NULL,
	"polish_id" uuid NOT NULL,
	"symmetry_id" uuid NOT NULL,
	"fluorescence_id" uuid NOT NULL,
	"price_per_carat_usd" numeric,
	"table_pct" numeric NOT NULL,
	"depth_pct" numeric NOT NULL,
	"length_mm" numeric NOT NULL,
	"width_mm" numeric NOT NULL,
	"depth_mm" numeric NOT NULL,
	CONSTRAINT "diamonds_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "gemstones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"gemstone_type_id" uuid NOT NULL,
	"shape_id" uuid NOT NULL,
	"carat" numeric NOT NULL,
	"color" text NOT NULL,
	"clarity" text NOT NULL,
	"cut_id" uuid NOT NULL,
	"treatment_id" uuid NOT NULL,
	"origin_id" uuid NOT NULL,
	"price_per_carat_usd" numeric,
	"length_mm" numeric NOT NULL,
	"width_mm" numeric NOT NULL,
	"depth_mm" numeric NOT NULL,
	CONSTRAINT "gemstones_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "melee_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"lab_grown" boolean NOT NULL,
	"shape_id" uuid NOT NULL,
	"size_range" text NOT NULL,
	"color_range" text NOT NULL,
	"clarity_range" text NOT NULL,
	"cut_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"total_carat_weight" numeric NOT NULL,
	CONSTRAINT "melee_lots_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"stock_id" text NOT NULL,
	"product_category_id" uuid NOT NULL,
	"price_usd" numeric NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "engagement_ring_available_metals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_ring_id" uuid NOT NULL,
	"metal_id" uuid NOT NULL,
	"price_usd" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_ring_compatible_stones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_ring_id" uuid NOT NULL,
	"shape_id" uuid NOT NULL,
	"max_carat" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_rings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"band_style_id" uuid NOT NULL,
	"ring_width_mm" numeric NOT NULL,
	CONSTRAINT "engagement_rings_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "tennis_bracelets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	CONSTRAINT "tennis_bracelets_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "wedding_band_available_metals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_band_id" uuid NOT NULL,
	"metal_id" uuid NOT NULL,
	"price_usd" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wedding_bands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"band_style_id" uuid NOT NULL,
	"ring_width_mm" numeric NOT NULL,
	CONSTRAINT "wedding_bands_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "order_checkouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_number" integer NOT NULL,
	"payment_term_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_checkouts_user_id_order_number_unique" UNIQUE("user_id","order_number")
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"event_type_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"currency_id" uuid NOT NULL,
	"rate" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"price_usd" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkout_id" uuid NOT NULL,
	"order_number" integer NOT NULL,
	"payment_term_id" uuid NOT NULL,
	"current_status" uuid,
	"estimated_delivery" date NOT NULL,
	"delivery_address_id" uuid NOT NULL,
	"shipping_cost" numeric DEFAULT '0' NOT NULL,
	"vat_amount" numeric DEFAULT '0' NOT NULL,
	"final_price_usd" numeric NOT NULL,
	"can_track" boolean DEFAULT false NOT NULL,
	"can_pay_invoice" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_checkout_id_order_number_unique" UNIQUE("checkout_id","order_number")
);
--> statement-breakpoint
CREATE TABLE "cart_item_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_item_id" uuid NOT NULL,
	"metal_id" uuid,
	"center_stone_product_id" uuid,
	"ring_size" numeric,
	"bracelet_length" numeric,
	"engraving_text" text,
	CONSTRAINT "cart_item_config_cart_item_id_unique" UNIQUE("cart_item_id")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"total_amount_usd" numeric NOT NULL,
	"current_status" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"ledger_entry_type_id" uuid NOT NULL,
	"order_id" uuid,
	"description" text NOT NULL,
	"amount_usd" numeric NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entry_exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_entry_id" uuid NOT NULL,
	"currency_id" uuid NOT NULL,
	"rate" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shortlist_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"lab_id" uuid NOT NULL,
	"certificate_number" text NOT NULL,
	"pdf_url" text,
	CONSTRAINT "certifications_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_thumbnail" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_shape_id_shapes_id_fk" FOREIGN KEY ("shape_id") REFERENCES "public"."shapes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_color_id_diamond_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."diamond_colors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_clarity_id_diamond_clarity_grades_id_fk" FOREIGN KEY ("clarity_id") REFERENCES "public"."diamond_clarity_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_cut_id_diamond_cut_grades_id_fk" FOREIGN KEY ("cut_id") REFERENCES "public"."diamond_cut_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_polish_id_diamond_polish_grades_id_fk" FOREIGN KEY ("polish_id") REFERENCES "public"."diamond_polish_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_symmetry_id_diamond_symmetry_grades_id_fk" FOREIGN KEY ("symmetry_id") REFERENCES "public"."diamond_symmetry_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamonds" ADD CONSTRAINT "diamonds_fluorescence_id_diamond_fluorescence_levels_id_fk" FOREIGN KEY ("fluorescence_id") REFERENCES "public"."diamond_fluorescence_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemstones" ADD CONSTRAINT "gemstones_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemstones" ADD CONSTRAINT "gemstones_gemstone_type_id_gemstone_types_id_fk" FOREIGN KEY ("gemstone_type_id") REFERENCES "public"."gemstone_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemstones" ADD CONSTRAINT "gemstones_shape_id_shapes_id_fk" FOREIGN KEY ("shape_id") REFERENCES "public"."shapes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemstones" ADD CONSTRAINT "gemstones_cut_id_gemstone_cut_grades_id_fk" FOREIGN KEY ("cut_id") REFERENCES "public"."gemstone_cut_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemstones" ADD CONSTRAINT "gemstones_treatment_id_gemstone_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."gemstone_treatments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gemstones" ADD CONSTRAINT "gemstones_origin_id_gemstone_origins_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."gemstone_origins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "melee_lots" ADD CONSTRAINT "melee_lots_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "melee_lots" ADD CONSTRAINT "melee_lots_shape_id_shapes_id_fk" FOREIGN KEY ("shape_id") REFERENCES "public"."shapes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "melee_lots" ADD CONSTRAINT "melee_lots_cut_id_diamond_cut_grades_id_fk" FOREIGN KEY ("cut_id") REFERENCES "public"."diamond_cut_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_ring_available_metals" ADD CONSTRAINT "engagement_ring_available_metals_engagement_ring_id_engagement_rings_id_fk" FOREIGN KEY ("engagement_ring_id") REFERENCES "public"."engagement_rings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_ring_available_metals" ADD CONSTRAINT "engagement_ring_available_metals_metal_id_metals_id_fk" FOREIGN KEY ("metal_id") REFERENCES "public"."metals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_ring_compatible_stones" ADD CONSTRAINT "engagement_ring_compatible_stones_engagement_ring_id_engagement_rings_id_fk" FOREIGN KEY ("engagement_ring_id") REFERENCES "public"."engagement_rings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_ring_compatible_stones" ADD CONSTRAINT "engagement_ring_compatible_stones_shape_id_shapes_id_fk" FOREIGN KEY ("shape_id") REFERENCES "public"."shapes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_rings" ADD CONSTRAINT "engagement_rings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_rings" ADD CONSTRAINT "engagement_rings_band_style_id_band_styles_id_fk" FOREIGN KEY ("band_style_id") REFERENCES "public"."band_styles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tennis_bracelets" ADD CONSTRAINT "tennis_bracelets_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_band_available_metals" ADD CONSTRAINT "wedding_band_available_metals_wedding_band_id_wedding_bands_id_fk" FOREIGN KEY ("wedding_band_id") REFERENCES "public"."wedding_bands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_band_available_metals" ADD CONSTRAINT "wedding_band_available_metals_metal_id_metals_id_fk" FOREIGN KEY ("metal_id") REFERENCES "public"."metals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_bands" ADD CONSTRAINT "wedding_bands_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_bands" ADD CONSTRAINT "wedding_bands_band_style_id_band_styles_id_fk" FOREIGN KEY ("band_style_id") REFERENCES "public"."band_styles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_checkouts" ADD CONSTRAINT "order_checkouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_checkouts" ADD CONSTRAINT "order_checkouts_payment_term_id_payment_terms_id_fk" FOREIGN KEY ("payment_term_id") REFERENCES "public"."payment_terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_event_type_id_order_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."order_event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_exchange_rates" ADD CONSTRAINT "order_exchange_rates_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_exchange_rates" ADD CONSTRAINT "order_exchange_rates_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_id_order_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."order_checkouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_term_id_payment_terms_id_fk" FOREIGN KEY ("payment_term_id") REFERENCES "public"."payment_terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_current_status_order_event_types_id_fk" FOREIGN KEY ("current_status") REFERENCES "public"."order_event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_address_id_addresses_id_fk" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item_config" ADD CONSTRAINT "cart_item_config_cart_item_id_cart_items_id_fk" FOREIGN KEY ("cart_item_id") REFERENCES "public"."cart_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item_config" ADD CONSTRAINT "cart_item_config_metal_id_metals_id_fk" FOREIGN KEY ("metal_id") REFERENCES "public"."metals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item_config" ADD CONSTRAINT "cart_item_config_center_stone_product_id_products_id_fk" FOREIGN KEY ("center_stone_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_current_status_invoice_statuses_id_fk" FOREIGN KEY ("current_status") REFERENCES "public"."invoice_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_ledger_entry_type_id_ledger_entry_types_id_fk" FOREIGN KEY ("ledger_entry_type_id") REFERENCES "public"."ledger_entry_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry_exchange_rates" ADD CONSTRAINT "ledger_entry_exchange_rates_ledger_entry_id_ledger_entries_id_fk" FOREIGN KEY ("ledger_entry_id") REFERENCES "public"."ledger_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entry_exchange_rates" ADD CONSTRAINT "ledger_entry_exchange_rates_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist_items" ADD CONSTRAINT "shortlist_items_shortlist_id_shortlists_id_fk" FOREIGN KEY ("shortlist_id") REFERENCES "public"."shortlists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist_items" ADD CONSTRAINT "shortlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_lab_id_certification_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."certification_labs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;

-- Trigger: auto-assign per-user checkout order number
CREATE FUNCTION assign_checkout_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := COALESCE(
    (SELECT MAX(order_number) FROM order_checkouts WHERE user_id = NEW.user_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_checkout_order_number
BEFORE INSERT ON order_checkouts
FOR EACH ROW
EXECUTE FUNCTION assign_checkout_order_number();

-- Trigger: auto-assign positional order number within checkout
CREATE FUNCTION assign_order_item_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := COALESCE(
    (SELECT MAX(order_number) FROM orders WHERE checkout_id = NEW.checkout_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_item_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION assign_order_item_number();

-- Trigger: auto-update orders.current_status on new order event
CREATE FUNCTION update_order_current_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET current_status = (
    SELECT event_type_id
    FROM order_events
    WHERE order_id = NEW.order_id
    ORDER BY occurred_at DESC
    LIMIT 1
  )
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_event_status
AFTER INSERT ON order_events
FOR EACH ROW
EXECUTE FUNCTION update_order_current_status();

-- Trigger: auto-update invoices.current_status on new ledger entry
-- IMPORTANT: Copy this trigger verbatim from the existing migration. Do not rewrite.
CREATE FUNCTION update_invoice_current_status()
RETURNS TRIGGER AS $$
DECLARE
  total_charges numeric;
  total_payments numeric;
BEGIN
  SELECT COALESCE(SUM(le.amount_usd), 0) INTO total_charges
  FROM ledger_entries le
  JOIN ledger_entry_types lt ON le.ledger_entry_type_id = lt.id
  WHERE le.invoice_id = NEW.invoice_id
    AND lt.value IN ('order_charge', 'fine');

  SELECT COALESCE(SUM(le.amount_usd), 0) INTO total_payments
  FROM ledger_entries le
  JOIN ledger_entry_types lt ON le.ledger_entry_type_id = lt.id
  WHERE le.invoice_id = NEW.invoice_id
    AND lt.value IN ('payment', 'credit', 'reimbursement');

  UPDATE invoices
  SET current_status = (
    CASE
      WHEN total_payments >= total_charges THEN (SELECT id FROM invoice_statuses WHERE value = 'paid')
      WHEN total_payments > 0 THEN (SELECT id FROM invoice_statuses WHERE value = 'partially_paid')
      ELSE (SELECT id FROM invoice_statuses WHERE value = 'issued')
    END
  )
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_entry_status
AFTER INSERT ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION update_invoice_current_status();

-- Partial indexes (diamond PLP performance)
CREATE INDEX idx_diamonds_natural_carat ON diamonds (carat) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_carat ON diamonds (carat) WHERE lab_grown = true;
CREATE INDEX idx_diamonds_natural_price ON diamonds (price_per_carat_usd) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_price ON diamonds (price_per_carat_usd) WHERE lab_grown = true;

-- Foreign key indexes
CREATE INDEX idx_products_supplier ON products (supplier_id);
CREATE INDEX idx_products_category ON products (product_category_id);
CREATE INDEX idx_diamonds_product ON diamonds (product_id);
CREATE INDEX idx_gemstones_product ON gemstones (product_id);
CREATE INDEX idx_melee_product ON melee_lots (product_id);
CREATE INDEX idx_engagement_rings_product ON engagement_rings (product_id);
CREATE INDEX idx_wedding_bands_product ON wedding_bands (product_id);
CREATE INDEX idx_tennis_bracelets_product ON tennis_bracelets (product_id);
CREATE INDEX idx_orders_checkout ON orders (checkout_id);
CREATE INDEX idx_orders_status ON orders (current_status);
CREATE INDEX idx_order_products_order ON order_products (order_id);
CREATE INDEX idx_order_events_order ON order_events (order_id);
CREATE INDEX idx_invoices_user ON invoices (user_id);
CREATE INDEX idx_ledger_entries_invoice ON ledger_entries (invoice_id);
CREATE INDEX idx_cart_items_user ON cart_items (user_id);
CREATE INDEX idx_shortlist_items_shortlist ON shortlist_items (shortlist_id);

-- Search indexes
CREATE INDEX idx_products_description_fts ON products USING GIN(to_tsvector('english', description));
CREATE INDEX idx_certifications_number ON certifications (certificate_number);