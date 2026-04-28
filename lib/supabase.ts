import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export async function signUpUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}

export async function updateCurrentUserProfile(accountName: string, email: string) {
  const { data, error } = await supabase.auth.updateUser({
    email,
    data: {
      full_name: accountName,
    },
  });
  return { data, error };
}

// Database query helpers
export async function getProducts() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getProductById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .single();
  return { data, error };
}

export async function createProduct(product: {
  sku_code: string;
  product_name: string;
  category: string;
  unit_type: string;
  unit_price: number;
  buy_price?: number;
  sell_price?: number;
  current_stock?: number;
  minimum_stock?: number;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      created_by: user?.id,
    })
    .select();
  return { data, error };
}

export async function updateProduct(
  id: string,
  updates: Record<string, string | number | boolean>
) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("products")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .select();
  return { data, error };
}

export async function deleteProduct(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: { message: "Unauthorized" } };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);
  return { error };
}

// Customer helpers
export async function getCustomers() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function createCustomer(customer: {
  business_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  city_area?: string;
  address?: string;
  credit_limit?: number;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      ...customer,
      created_by: user?.id,
    })
    .select();
  return { data, error };
}

export async function updateCustomer(
  id: string,
  updates: Record<string, string | number | boolean>
) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("customers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .select();
  return { data, error };
}

// Purchase Order helpers
export async function getPurchaseOrders() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function createPurchaseOrder(po: {
  po_number: string;
  supplier_name: string;
  expected_delivery_date?: string;
  payment_terms?: string;
  total_amount?: number;
  notes?: string;
  items?: Array<{
    product_id?: string;
    product_name: string;
    sku_code?: string;
    category?: string;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const user = await getCurrentUser();

  // Create PO record
  const { data: poData, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: po.po_number,
      supplier_name: po.supplier_name,
      expected_delivery_date: po.expected_delivery_date,
      payment_terms: po.payment_terms,
      total_amount: po.total_amount,
      notes: po.notes,
      created_by: user?.id,
    })
    .select()
    .single();

  if (poError || !poData) {
    return { data: null, error: poError };
  }

  // Create PO items
  if (po.items && po.items.length > 0) {
    const itemsWithPOId = po.items.map((item) => ({
      ...item,
      po_id: poData.id,
      line_total: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("po_items")
      .insert(itemsWithPOId);

    if (itemsError) {
      return { data: null, error: itemsError };
    }
  }

  return { data: poData, error: null };
}

export async function updatePurchaseOrder(
  id: string,
  updates: Record<string, string | number | boolean | Date>
) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("purchase_orders")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .select();
  return { data, error };
}

// Invoice helpers
export async function getInvoices() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  return { data, error };
}

// Stock movement helpers
export async function recordStockMovement(movement: {
  product_id: string;
  movement_type: "purchase" | "sale" | "adjustment" | "return";
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("stock_movements")
    .insert({
      ...movement,
      created_by: user?.id,
    })
    .select();
  return { data, error };
}

export async function getStockMovements(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  return { data, error };
}
