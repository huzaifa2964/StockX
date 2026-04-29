-- Create Invoices Table
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

-- Create Invoice Items Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_created_by ON public.invoice_items(created_by);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON public.invoice_items(product_id);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can read own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert own invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice_items" ON public.invoice_items;

-- Create RLS Policies for Invoices
CREATE POLICY "Users can read own invoices" ON public.invoices 
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own invoices" ON public.invoices 
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own invoices" ON public.invoices 
  FOR UPDATE USING (created_by = auth.uid());

-- Create RLS Policies for Invoice Items
CREATE POLICY "Users can read own invoice_items" ON public.invoice_items 
  FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own invoice_items" ON public.invoice_items 
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own invoice_items" ON public.invoice_items 
  FOR UPDATE USING (created_by = auth.uid());
