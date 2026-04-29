"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/protected-route";
import { UserMenu } from "@/components/user-menu";
import { InvoicePreviewModal } from "@/components/invoice-preview-modal";
import { useAuth } from "@/app/providers";
import { createInvoice, getCustomers, getInvoices, getProducts } from "@/lib/supabase";
import {
  AlertTriangle,
  BadgeDollarSign,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  Plus,
  ReceiptText,
  ShoppingCart,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

type ProductRow = {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  current_stock: number;
  sell_price: number | null;
};

type CustomerRow = {
  id: string;
  business_name: string;
  status: string | null;
  outstanding_balance: number | null;
  credit_limit: number | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  total_amount: number | null;
  paid_amount: number | null;
  status: string | null;
  due_date: string | null;
  created_at: string | null;
};

type InvoiceLineItem = {
  id: string;
  productId: string;
  productName: string;
  skuCode: string;
  category: string;
  quantity: number;
  unitPrice: number;
  availableStock: number;
};

const invoiceStatusStyles: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Partial: "bg-amber-50 text-amber-700 ring-amber-100",
  Pending: "bg-slate-100 text-slate-700 ring-slate-200",
};

const customerStatusStyles: Record<string, string> = {
  "Good Standing": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  "At Risk": "bg-red-50 text-red-700 ring-red-100",
};

function createBlankItem(): InvoiceLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: "",
    productName: "",
    skuCode: "",
    category: "",
    quantity: 1,
    unitPrice: 0,
    availableStock: 0,
  };
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function currency(value: number) {
  return `Rs ${value.toLocaleString()}`;
}

export default function SalesPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [items, setItems] = useState<InvoiceLineItem[]>([createBlankItem()]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayValue());
  const [dueDate, setDueDate] = useState(plusDays(7));
  const [paidAmount, setPaidAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<{
    invoiceNumber: string;
    customerName: string;
    invoiceDate: string;
    dueDate: string;
    items: Array<{
      productName: string;
      skuCode: string;
      category: string;
      quantity: number;
      unitPrice: number;
    }>;
    subtotal: number;
    paidAmount: number;
    balanceDue: number;
    notes?: string;
    status?: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [productsResult, customersResult, invoicesResult] = await Promise.all([
        getProducts(),
        getCustomers(),
        getInvoices(),
      ]);

      setProducts((productsResult.data as ProductRow[]) || []);
      setCustomers((customersResult.data as CustomerRow[]) || []);
      setInvoices((invoicesResult.data as InvoiceRow[]) || []);
    } catch (loadError) {
      console.warn("Could not load sales data:", loadError);
      setProducts([]);
      setCustomers([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    loadData();
  }, [user?.id, loadData]);

  const productLookup = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const invoiceTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const paidAmountValue = Number(paidAmount || 0);
  const balanceDue = Math.max(invoiceTotal - Math.max(paidAmountValue, 0), 0);
  const lowStockCount = products.filter((product) => product.current_stock <= 0).length;
  const stockWarnings = items.filter((item) => item.productId && item.quantity > item.availableStock);
  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  const todayInvoices = invoices.filter((invoice) => {
    if (!invoice.created_at) return false;
    return invoice.created_at.slice(0, 10) === todayValue();
  }).length;
  const grossSales = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
  const collectedAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.paid_amount || 0), 0);
  const receivables = Math.max(grossSales - collectedAmount, 0);
  const dueSoon = invoices.filter((invoice) => {
    if (!invoice.due_date || invoice.status === "Paid") return false;
    const due = new Date(invoice.due_date);
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    return due >= new Date() && due <= limit;
  }).length;

  const summaryCards = [
    { label: "Invoices Today", value: todayInvoices.toString(), detail: "Created on the current date" },
    { label: "Gross Sales", value: currency(grossSales), detail: "All invoice totals" },
    { label: "Collections Received", value: currency(collectedAmount), detail: "Paid against invoices" },
    { label: "Receivables", value: currency(receivables), detail: "Remaining customer balance" },
  ];

  const recentInvoices = [...invoices]
    .sort((left, right) => Number(new Date(right.created_at || 0)) - Number(new Date(left.created_at || 0)))
    .slice(0, 8)
    .map((invoice) => {
      const customer = customers.find((item) => item.id === invoice.customer_id);
      return {
        ...invoice,
        customerName: customer?.business_name || "Unknown customer",
      };
    });

  const addItem = () => {
    setItems((current) => [...current, createBlankItem()]);
  };

  const removeItem = (id: string) => {
    setItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  };

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        if (field === "productId" && typeof value === "string") {
          const product = productLookup.get(value);
          if (!product) return item;

          return {
            ...item,
            productId: value,
            productName: product.product_name,
            skuCode: product.sku_code,
            category: product.category,
            unitPrice: Number(product.sell_price || 0),
            availableStock: Number(product.current_stock || 0),
            quantity: Math.min(Math.max(item.quantity || 1, 1), Math.max(Number(product.current_stock || 0), 1)),
          };
        }

        if (field === "quantity" && typeof value === "number") {
          return { ...item, quantity: value };
        }

        if (field === "unitPrice" && typeof value === "number") {
          return { ...item, unitPrice: value };
        }

        return item;
      })
    );
  };

  const resetForm = () => {
    setItems([createBlankItem()]);
    setCustomerId("");
    setInvoiceDate(todayValue());
    setDueDate(plusDays(7));
    setPaidAmount("");
    setNotes("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!customerId) {
      setError("Select a customer before saving the invoice.");
      return;
    }

    if (items.some((item) => !item.productId)) {
      setError("Select a product for every invoice line.");
      return;
    }

    if (items.some((item) => item.quantity <= 0)) {
      setError("Quantity must be greater than zero for every line item.");
      return;
    }

    if (stockWarnings.length > 0) {
      setError("One or more items exceed available stock. Reduce quantity before saving.");
      return;
    }

    if (Number.isNaN(paidAmountValue) || paidAmountValue < 0) {
      setError("Paid amount must be a valid number.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: invoiceError } = await createInvoice({
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        paid_amount: paidAmountValue,
        notes,
        items: items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          sku_code: item.skuCode,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      });

      if (invoiceError) {
        setError(invoiceError.message || "Could not create invoice.");
        return;
      }

      // Create preview data from the current form state
      const previewData = {
        invoiceNumber: data?.invoice_number || `INV-${Date.now()}`,
        customerName: selectedCustomer?.business_name || "",
        invoiceDate,
        dueDate,
        items: items.map((item) => ({
          productName: item.productName,
          skuCode: item.skuCode,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        subtotal: invoiceTotal,
        paidAmount: paidAmountValue,
        balanceDue,
        notes: notes || undefined,
        status: paidAmountValue > 0 && paidAmountValue < invoiceTotal ? "Partial" : paidAmountValue >= invoiceTotal ? "Paid" : "Pending",
      };

      setCreatedInvoice(previewData);
      setShowPreview(true);
      setSuccessMessage(`Invoice ${data?.invoice_number || ""} created and stock deducted successfully.`);
      resetForm();
      await loadData();
    } catch (submitError: any) {
      setError(submitError?.message || "Could not create invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Al-Noor Beverages Distribution</p>
              <h1 className="mt-2 text-xl font-semibold text-slate-900">Agency Control Desk</h1>
            </div>

            <nav className="space-y-1 text-sm font-medium text-slate-600">
              {[
                { label: "Dashboard", href: "/", active: false },
                { label: "Sales / Invoices", href: "/sales", active: true },
                { label: "Inventory", href: "/inventory", active: false },
                { label: "Purchase Orders", href: "/purchase-orders", active: false },
                { label: "Customers", href: "/customers", active: false },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                    item.active ? "bg-blue-50 text-blue-700" : "hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.active ? <ChevronRight className="h-4 w-4" /> : null}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">Sales Health</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Invoices created</span>
                  <span className="font-semibold text-slate-900">{invoices.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Due in 7 days</span>
                  <span className="font-semibold text-amber-600">{dueSoon}</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
              <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
                <nav className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                  <span>Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-slate-800">Sales / Invoices</span>
                </nav>

                <div className="flex w-full items-center justify-between md:hidden">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Al-Noor Beverages</p>
                    <p className="text-sm font-semibold text-slate-900">Sales / Invoices</p>
                  </div>
                  <UserMenu compact />
                </div>

                <div className="relative order-3 w-full md:order-none md:flex-1 md:justify-center">
                  <ShoppingCart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    aria-label="Search invoice"
                    placeholder="Search invoice, customer, or product"
                    className="h-11 w-full rounded-full border-slate-200 bg-white pl-9 shadow-sm placeholder:text-slate-400 md:mx-auto md:max-w-xl"
                  />
                </div>

                <div className="ml-auto hidden items-center gap-3 md:flex">
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-full bg-white">
                    <ReceiptText className="h-4 w-4" />
                  </Button>
                  <UserMenu />
                </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Al-Noor Beverages Distribution</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                    Sales & Invoice Desk
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    Create sales invoices, deduct stock immediately, and keep customer balances accurate in one controlled flow.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/inventory"
                    className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Check Stock
                  </Link>
                  <Link
                    href="/customers"
                    className="inline-flex h-11 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Open Customers
                  </Link>
                </div>
              </div>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <Card key={card.label} className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">{card.label}</CardTitle>
                      <div className="text-3xl font-semibold tracking-tight text-slate-950">{card.value}</div>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-slate-500">{card.detail}</CardContent>
                  </Card>
                ))}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-950">Create Invoice</CardTitle>
                        <p className="mt-1 text-sm text-slate-500">
                          Select a customer, add sold items, and the app will update inventory stock automatically on save.
                        </p>
                      </div>
                      <Badge className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 ring-1 ring-blue-100">
                        Sales deduct stock immediately
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 p-4 sm:p-6">
                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMessage}
                      </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Customer</label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.business_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCustomer && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-slate-700">{selectedCustomer.business_name}</span>
                              <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${customerStatusStyles[selectedCustomer.status || "Good Standing"] || customerStatusStyles["Good Standing"]}`}>
                                {selectedCustomer.status || "Good Standing"}
                              </Badge>
                            </div>
                            <div className="mt-2 grid gap-1 sm:grid-cols-2">
                              <span>Outstanding: {currency(Number(selectedCustomer.outstanding_balance || 0))}</span>
                              <span>Credit limit: {currency(Number(selectedCustomer.credit_limit || 0))}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Invoice Date</label>
                        <Input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Due Date</label>
                        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Invoice Items</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Choose products from your live inventory catalog. Quantities cannot exceed available stock.
                          </p>
                        </div>
                        <Button type="button" onClick={addItem} variant="outline" className="h-9 rounded-full px-3 text-xs font-medium text-blue-600">
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add Line
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {items.map((item) => {
                          const lineTotal = item.quantity * item.unitPrice;
                          const overStock = item.productId && item.quantity > item.availableStock;

                          return (
                            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_auto] lg:items-end">
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700">Product</label>
                                  <Select value={item.productId} onValueChange={(value) => updateItem(item.id, "productId", value)}>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products.length > 0 ? (
                                        products.map((product) => (
                                          <SelectItem key={product.id} value={product.id} disabled={Number(product.current_stock || 0) <= 0}>
                                            {product.sku_code} - {product.product_name}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="no-products" disabled>
                                          No products in inventory
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                  {item.productName && (
                                    <p className="text-[11px] text-slate-500">
                                      {item.category} • {item.availableStock} available
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700">Quantity</label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={Math.max(item.availableStock, 1)}
                                    value={item.quantity}
                                    onChange={(event) => updateItem(item.id, "quantity", Number(event.target.value) || 0)}
                                    className={overStock ? "border-red-500" : ""}
                                  />
                                  {overStock && (
                                    <p className="text-[11px] text-red-600">Only {item.availableStock} available.</p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700">Unit Price</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={item.unitPrice}
                                    onChange={(event) => updateItem(item.id, "unitPrice", Number(event.target.value) || 0)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-slate-700">Line Total</label>
                                  <div className="flex h-11 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900">
                                    {currency(lineTotal)}
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <Button type="button" onClick={() => removeItem(item.id)} variant="outline" className="h-10 rounded-full px-3 text-xs font-medium text-red-600 hover:bg-red-50">
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Amount Received</label>
                        <Input
                          type="number"
                          min={0}
                          value={paidAmount}
                          onChange={(event) => setPaidAmount(event.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Notes</label>
                        <Input
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Optional sales note"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-slate-200 bg-white shadow-sm sticky top-24">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-950">Invoice Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Items</span>
                            <span className="font-medium text-slate-900">{items.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-semibold text-slate-900">{currency(invoiceTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Received</span>
                            <span className="font-semibold text-emerald-600">{currency(paidAmountValue || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="text-slate-700">Balance Due</span>
                            <span className="text-lg font-semibold text-blue-700">{currency(balanceDue)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-slate-600">
                            <BadgeDollarSign className="h-4 w-4 text-blue-600" />
                            Receivables impact
                          </span>
                          <span className="font-semibold text-slate-900">{currency(balanceDue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-slate-600">
                            <Truck className="h-4 w-4 text-blue-600" />
                            Stock deduction
                          </span>
                          <span className="font-semibold text-red-600">Immediate on save</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-slate-600">
                            <CircleDollarSign className="h-4 w-4 text-emerald-600" />
                            Low stock items
                          </span>
                          <span className="font-semibold text-slate-900">{lowStockCount}</span>
                        </div>
                      </div>

                      {stockWarnings.length > 0 && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          <div className="flex items-center gap-2 font-semibold">
                            <AlertTriangle className="h-4 w-4" />
                            Quantity exceeds available stock
                          </div>
                          <p className="mt-2 text-xs text-amber-700">
                            Reduce the highlighted line items before creating the invoice.
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-12 w-full rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        {submitting ? "Saving invoice..." : "Create Invoice & Deduct Stock"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-950">Customer Credit Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {customers
                        .filter((customer) => Number(customer.credit_limit || 0) > 0)
                        .slice(0, 4)
                        .map((customer) => {
                          const utilization = Math.round(
                            (Number(customer.outstanding_balance || 0) / Math.max(Number(customer.credit_limit || 1), 1)) * 100
                          );

                          return (
                            <div key={customer.id}>
                              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                <span>{customer.business_name}</span>
                                <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${customerStatusStyles[customer.status || "Good Standing"] || customerStatusStyles["Good Standing"]}`}>
                                  {customer.status || "Good Standing"}
                                </Badge>
                              </div>
                              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                <span>{currency(Number(customer.outstanding_balance || 0))} used</span>
                                <span>{utilization}% of credit</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${utilization >= 90 ? "bg-red-500" : utilization >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-950">Inventory Impact Preview</CardTitle>
                        <p className="mt-1 text-sm text-slate-500">
                          Quantities shown here are what will be deducted from stock when the invoice is saved.
                        </p>
                      </div>
                      <Badge className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100">
                        {stockWarnings.length > 0 ? `${stockWarnings.length} issues` : "Ready"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 sm:p-6">
                    {items.map((item) => {
                      const remaining = item.availableStock - item.quantity;

                      return (
                        <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{item.productName || "Select a product"}</p>
                              <p className="text-xs text-slate-500">{item.skuCode || "No SKU selected"}</p>
                            </div>
                            <Badge className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${remaining < 0 ? "bg-red-50 text-red-700 ring-red-100" : remaining === 0 ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
                              {remaining < 0 ? "Overstock" : `${remaining} left`}
                            </Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <p>Current: {item.availableStock}</p>
                            <p>Deduct: {item.quantity}</p>
                            <p>Unit: {currency(item.unitPrice)}</p>
                            <p>Total: {currency(item.quantity * item.unitPrice)}</p>
                          </div>
                        </div>
                      );
                    })}

                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        Add line items to preview the stock impact.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-950">Recent Invoices</CardTitle>
                        <p className="mt-1 text-sm text-slate-500">
                          A live view of created invoices, payment status, and due balances.
                        </p>
                      </div>
                      <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                        {recentInvoices.length} shown
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 sm:p-6">
                    {recentInvoices.length > 0 ? (
                      recentInvoices.map((invoice) => (
                        <div key={invoice.id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{invoice.invoice_number}</p>
                              <p className="text-xs text-slate-500">{invoice.customerName}</p>
                            </div>
                            <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${invoiceStatusStyles[invoice.status || "Pending"] || invoiceStatusStyles.Pending}`}>
                              {invoice.status || "Pending"}
                            </Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <p>Total: {currency(Number(invoice.total_amount || 0))}</p>
                            <p>Paid: {currency(Number(invoice.paid_amount || 0))}</p>
                            <p>Due: {invoice.due_date || "N/A"}</p>
                            <p>Created: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("en-GB") : "N/A"}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        {loading ? "Loading invoice history..." : "No invoices created yet. Build the first sale above."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            </main>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
          <div className="mx-auto flex w-full max-w-md items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-1 text-slate-500">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link href="/sales" className="flex flex-col items-center gap-1 text-blue-700">
              <ReceiptText className="h-5 w-5" />
              <span className="text-xs font-medium">Sales</span>
            </Link>
            <Link href="/inventory" className="flex flex-col items-center gap-1 text-slate-500">
              <Boxes className="h-5 w-5" />
              <span className="text-xs font-medium">Inventory</span>
            </Link>
            <Link href="/customers" className="flex flex-col items-center gap-1 text-slate-500">
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Customers</span>
            </Link>
          </div>
        </nav>
      </div>

      {createdInvoice && (
        <InvoicePreviewModal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setCreatedInvoice(null);
          }}
          invoiceNumber={createdInvoice.invoiceNumber}
          customerName={createdInvoice.customerName}
          invoiceDate={createdInvoice.invoiceDate}
          dueDate={createdInvoice.dueDate}
          items={createdInvoice.items}
          subtotal={createdInvoice.subtotal}
          paidAmount={createdInvoice.paidAmount}
          balanceDue={createdInvoice.balanceDue}
          notes={createdInvoice.notes}
          status={createdInvoice.status}
        />
      )}
    </ProtectedRoute>
  );
}
