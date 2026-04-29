# Database Setup Instructions

The database tables need to be created manually in your Supabase dashboard. Follow these steps:

## Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **mpqwhqcrenfzyhdhpbga**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** button

## Step 2: Copy and Paste the SQL

Open the file: `migrations/001_create_tables.sql`

Copy **ALL** the SQL code and paste it into the Supabase SQL Editor query box.

## Step 3: Execute the Query

Click the **Run** button (or press `Ctrl+Enter`) to execute all the SQL commands.

You should see a success message: "Queries executed successfully"

## Step 4: Verify Tables Were Created

After successful execution:
1. Go to **Table Editor** in the left sidebar
2. You should see these new tables:
   - ✅ `products`
   - ✅ `customers`
   - ✅ `purchase_orders`
   - ✅ `stock_movements`

## Step 5: Test the Application

Once tables are created, all three features will work:
- **+ Register Customer** button in Customers page
- **+ Register New Item** button in Inventory page
- **+ Create Purchase Order** button in Purchase Orders page

---

## What's Being Created

### Tables:
1. **products** - Beverage inventory with SKU, prices, and stock levels
2. **customers** - Retail customers with credit terms and contact info
3. **purchase_orders** - Supplier orders with delivery dates
4. **stock_movements** - Tracks inventory changes (for future use)

### Security:
- Row Level Security (RLS) enabled on all tables
- Anonymous users can read and insert data
- Indexes created for performance

---

## Troubleshooting

**Error: "Relation already exists"**
- Tables may already exist. Check Table Editor to confirm.
- If you want to recreate: Delete existing tables first, then run the SQL again.

**Error: "Permission denied"**
- Make sure you're logged into Supabase with an account that has admin access to this project.

**Tables created but app still says table not found**
- Clear your browser cache: `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
- Restart the development server: Stop dev server and run `npm run dev` again
