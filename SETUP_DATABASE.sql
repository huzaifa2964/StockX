-- =====================================================
-- Al-Noor Beverages Distribution Dashboard - Database Setup
-- Project: mpqwhqcrenfzyhdhpbga
-- SAFE VERSION: Drops and recreates all objects
-- =====================================================

-- =====================================================
-- DROP EXISTING POLICIES (IF ANY)
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.customers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.purchase_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.purchase_orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.purchase_orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.stock_movements;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stock_movements;

-- =====================================================
-- DROP EXISTING INDEXES (IF ANY)
-- =====================================================
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_customers_business_name;
DROP INDEX IF EXISTS idx_customers_city_area;
DROP INDEX IF EXISTS idx_purchase_orders_po_number;
DROP INDEX IF EXISTS idx_purchase_orders_supplier;
DROP INDEX IF EXISTS idx_stock_movements_product_id;

-- =====================================================
-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  sku_code TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  buy_price DECIMAL(10, 2),
  sell_price DECIMAL(10, 2),
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  business_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  city_area TEXT,
  status TEXT DEFAULT 'Good Standing',
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0,
  payment_terms TEXT,
  last_order_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_name TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Approval',
  expected_delivery_date DATE,
  payment_terms TEXT,
  total_amount DECIMAL(12, 2),
  items_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Stock Movements Table
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

ALTER TABLE public.products ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.customers ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.purchase_orders ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.stock_movements ALTER COLUMN created_by SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON public.customers(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by ON public.stock_movements(created_by);

-- =====================================================
-- Create RLS Policies for Products
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
CREATE POLICY "Users can read own products" ON public.products 
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own products" ON public.products 
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own products" ON public.products 
  FOR UPDATE USING (created_by = auth.uid());

-- =====================================================
-- Create RLS Policies for Customers
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.customers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.customers;
CREATE POLICY "Users can read own customers" ON public.customers 
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own customers" ON public.customers 
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own customers" ON public.customers 
  FOR UPDATE USING (created_by = auth.uid());

-- =====================================================
-- Create RLS Policies for Purchase Orders
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.purchase_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.purchase_orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.purchase_orders;
CREATE POLICY "Users can read own purchase_orders" ON public.purchase_orders 
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own purchase_orders" ON public.purchase_orders 
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own purchase_orders" ON public.purchase_orders 
  FOR UPDATE USING (created_by = auth.uid());

-- =====================================================
-- Create RLS Policies for Stock Movements
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stock_movements;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stock_movements;
CREATE POLICY "Users can read own stock_movements" ON public.stock_movements 
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own stock_movements" ON public.stock_movements 
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- =====================================================
-- Create Indexes for Better Performance
-- =====================================================
CREATE INDEX idx_products_sku ON public.products(sku_code);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_customers_business_name ON public.customers(business_name);
CREATE INDEX idx_customers_city_area ON public.customers(city_area);
CREATE INDEX idx_purchase_orders_po_number ON public.purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_name);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- =====================================================
-- Invoices Table (additive migration for existing databases)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku_code TEXT,
  category TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS sku_code TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_created_by ON public.invoice_items(created_by);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON public.invoice_items(product_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can read own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice_items" ON public.invoice_items;

CREATE POLICY "Users can read own invoices" ON public.invoices
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own invoices" ON public.invoices
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own invoices" ON public.invoices
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can read own invoice_items" ON public.invoice_items
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own invoice_items" ON public.invoice_items
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own invoice_items" ON public.invoice_items
  FOR UPDATE USING (created_by = auth.uid());

-- To verify the tables were created successfully:
-- 1. Go to https://app.supabase.com
-- 2. Select project: mpqwhqcrenfzyhdhpbga
-- 3. Click "Table Editor" in the left sidebar
-- 4. You should see: products, customers, purchase_orders, stock_movements
-- 5. Refresh your Next.js app at http://localhost:3000
-- Your dashboard is now ready for production use!
