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

  const { error } = await supabase.from("products").delete().eq("id", id).eq("created_by", user.id);
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

export async function createInvoice(invoice: {
  customer_id: string;
  invoice_date?: string;
  due_date?: string;
  paid_amount?: number;
  notes?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    sku_code?: string;
    category?: string;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: "Unauthorized" } };

  if (!invoice.items || invoice.items.length === 0) {
    return { data: null, error: { message: "Add at least one item to create an invoice." } };
  }

  const normalizedItems = invoice.items.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
  }));

  const productIds = Array.from(new Set(normalizedItems.map((item) => item.product_id)));
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, product_name, sku_code, category, current_stock")
    .in("id", productIds)
    .eq("created_by", user.id);

  if (productsError) {
    return { data: null, error: productsError };
  }

  const productLookup = new Map(
    (products || []).map((product) => [product.id, product])
  );

  for (const item of normalizedItems) {
    if (item.quantity <= 0) {
      return { data: null, error: { message: `Quantity for ${item.product_name} must be greater than zero.` } };
    }

    const product = productLookup.get(item.product_id);
    if (!product) {
      return { data: null, error: { message: `${item.product_name} is not available in your catalog.` } };
    }

    if (item.quantity > Number(product.current_stock || 0)) {
      return {
        data: null,
        error: { message: `${product.product_name} only has ${Number(product.current_stock || 0)} units available.` },
      };
    }
  }

  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const paidAmount = Math.max(0, Math.min(Number(invoice.paid_amount || 0), totalAmount));
  const balanceDue = Math.max(totalAmount - paidAmount, 0);
  const invoiceStatus = paidAmount >= totalAmount ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-7)}`;

  const { data: customerRow, error: customerError } = await supabase
    .from("customers")
    .select("id, outstanding_balance")
    .eq("id", invoice.customer_id)
    .eq("created_by", user.id)
    .single();

  if (customerError) {
    return { data: null, error: customerError };
  }

  const { data: invoiceRow, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      customer_id: invoice.customer_id,
      total_amount: totalAmount,
      status: invoiceStatus,
      due_date: invoice.due_date,
      invoice_date: invoice.invoice_date || new Date().toISOString().slice(0, 10),
      notes: invoice.notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (invoiceError || !invoiceRow) {
    return { data: null, error: invoiceError };
  }

  const createdItemRows = normalizedItems.map((item) => ({
    invoice_id: invoiceRow.id,
    product_id: item.product_id,
    product_name: item.product_name,
    sku_code: item.sku_code,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase.from("invoice_items").insert(createdItemRows);
  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoiceRow.id).eq("created_by", user.id);
    return { data: null, error: itemsError };
  }

  const updatedProducts: Array<{ id: string; current_stock: number }> = [];

  try {
    for (const item of normalizedItems) {
      const product = productLookup.get(item.product_id);
      if (!product) {
        throw new Error(`${item.product_name} is no longer available in the catalog.`);
      }
      const nextStock = Number(product.current_stock || 0) - item.quantity;

      const { error: stockError } = await supabase
        .from("products")
        .update({
          current_stock: nextStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)
        .eq("created_by", user.id);

      if (stockError) {
        throw stockError;
      }

      updatedProducts.push({ id: product.id, current_stock: Number(product.current_stock || 0) });

      const { error: movementError } = await supabase.from("stock_movements").insert({
        created_by: user.id,
        product_id: product.id,
        movement_type: "sale",
        quantity: item.quantity,
        reference_type: "invoice",
        reference_id: invoiceRow.id,
        notes: `Invoice ${invoiceNumber}`,
      });

      if (movementError) {
        throw movementError;
      }
    }

    if (balanceDue > 0) {
      const { error: customerUpdateError } = await supabase
        .from("customers")
        .update({
          outstanding_balance: Number(customerRow.outstanding_balance || 0) + balanceDue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.customer_id)
        .eq("created_by", user.id);

      if (customerUpdateError) {
        throw customerUpdateError;
      }
    }

    return { data: invoiceRow, error: null };
  } catch (error: any) {
    for (const restoredProduct of updatedProducts) {
      await supabase
        .from("products")
        .update({
          current_stock: restoredProduct.current_stock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", restoredProduct.id)
        .eq("created_by", user.id);
    }

    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceRow.id);
    await supabase.from("invoices").delete().eq("id", invoiceRow.id).eq("created_by", user.id);

    return { data: null, error };
  }
}
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
