# Supabase Integration Setup Guide

## Step 1: Get Your API Keys

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)** → Select your project "mpqwhqcrenfzyhdhpbga"
2. Click **Settings** (gear icon) in the left sidebar
3. Click **API** tab
4. Copy these values:
   - **Project URL** (looks like `https://mpqwhqcrenfzyhdhpbga.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOi...`)

## Step 2: Update Environment Variables

1. Open `.env.local` in the stockx folder
2. Replace with your actual API keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://mpqwhqcrenfzyhdhpbga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Save the file.

## Step 3: Create Database Schema

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL schema below
4. Click **Run**

### Database Schema SQL:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff', -- 'admin', 'manager', 'staff'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products/Inventory table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  buy_price DECIMAL(10, 2),
  sell_price DECIMAL(10, 2),
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  image_url TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stock transactions/movements
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  city_area TEXT,
  address TEXT,
  status TEXT DEFAULT 'Good Standing',
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0,
  last_order_date DATE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_name TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Approval',
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  payment_terms TEXT,
  total_amount DECIMAL(12, 2),
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS public.po_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  sku_code TEXT,
  category TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2),
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  total_amount DECIMAL(12, 2),
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  due_date DATE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.customers(id),
  payment_method TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Allow authenticated users to read products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow users to read customers" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to read purchase orders" ON public.purchase_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to insert purchase orders" ON public.purchase_orders
  FOR INSERT TO authenticated WITH CHECK (true);
```

## Step 4: Test the Connection

Run the dev server and check the browser console:

```bash
npm run dev
```

Visit `http://localhost:3000` and check that there are no Supabase errors.

## Step 5: Create Sample Data (Optional)

You can insert sample products and customers directly in Supabase:

1. Go to **SQL Editor** → **New Query**
2. Insert sample products:

```sql
INSERT INTO public.products (sku_code, product_name, category, unit_type, unit_price, buy_price, sell_price, minimum_stock) VALUES
('COLA-1.5L', 'Coca-Cola 1.5L', 'Soda', 'Single Bottle', 185, 140, 185, 50),
('WATER-1.5L', 'Aqua Pure 1.5L', 'Water', 'Single Bottle', 120, 85, 120, 75),
('JUICE-1L', 'Fresh Orange Juice 1L', 'Juice', 'Single Bottle', 220, 165, 220, 40),
('ENERGY-500ML', 'Energy Rush 500ML', 'Energy', 'Single Bottle', 350, 260, 350, 30);
```

3. Insert sample customers:

```sql
INSERT INTO public.customers (business_name, contact_person, phone, email, city_area, status) VALUES
('Ahmad Stores', 'Ahmad Khan', '03001234567', 'ahmad@stores.pk', 'Karachi', 'Good Standing'),
('Karimi Mart', 'Fatima Karimi', '03009876543', 'fatima@karimi.pk', 'Karachi', 'Good Standing'),
('Quick Shop Gulshan', 'Hassan Ali', '03115555666', 'hassan@quickshop.pk', 'Gulshan', 'Pending');
```

## Step 6: Update Your App to Use Supabase

Already done! The following files are ready to use Supabase:
- `lib/supabase.ts` - Database client and helper functions
- `.env.local` - Environment variables

## Available Functions

The `lib/supabase.ts` file provides:

### Auth Functions
- `signUpUser(email, password)` - Create new user
- `signInUser(email, password)` - Login
- `signOutUser()` - Logout
- `getCurrentUser()` - Get current user
- `resetPassword(email)` - Reset password

### Product Functions
- `getProducts()` - Fetch all products
- `getProductById(id)` - Fetch one product
- `createProduct(data)` - Add new product
- `updateProduct(id, updates)` - Update product
- `deleteProduct(id)` - Delete product

### Customer Functions
- `getCustomers()` - Fetch all customers
- `createCustomer(data)` - Add new customer
- `updateCustomer(id, updates)` - Update customer

### Purchase Order Functions
- `getPurchaseOrders()` - Fetch all POs
- `createPurchaseOrder(po)` - Create new PO with items
- `updatePurchaseOrder(id, updates)` - Update PO

### Stock Functions
- `recordStockMovement(data)` - Log stock movement
- `getStockMovements(productId)` - Get product stock history

## Next Steps

To integrate Supabase into your pages:

1. Import from `lib/supabase.ts`:
```typescript
import { getProducts, createProduct, getCustomers } from "@/lib/supabase";
```

2. Use in React components:
```typescript
const [products, setProducts] = useState([]);

useEffect(() => {
  const loadProducts = async () => {
    const { data, error } = await getProducts();
    if (data) setProducts(data);
  };
  loadProducts();
}, []);
```

3. Replace hardcoded sample data with Supabase queries

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Check that `.env.local` has correct URL and Anon Key
- Restart dev server after updating `.env.local`

**Error: "Permission denied"**
- Check RLS policies in Supabase Dashboard
- Make sure you're signed in

**Connection timeout**
- Check that NEXT_PUBLIC_SUPABASE_URL is correct
- Ensure internet connection to supabase.co

## Support

For more info: https://supabase.com/docs
