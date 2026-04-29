"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useAuth } from "@/app/providers";
import { getCurrentUser, supabase } from "@/lib/supabase";

interface POItem {
  id: string;
  skuCode: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

interface ProductOption {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  sell_price: number | null;
}

interface FormErrors {
  [key: string]: string;
}

const paymentTermsOptions = [
  "Net 7 Days",
  "Net 15 Days",
  "Net 30 Days",
  "Net 45 Days",
  "Cash on Delivery",
  "Advance Payment",
];

export function CreatePurchaseOrderSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const poCounterRef = useRef(0);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<POItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      if (!open) return;

      try {
        const user = await getCurrentUser();
        if (!user) {
          setProductOptions([]);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("id, sku_code, product_name, category, sell_price")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Could not load product catalog for purchase orders:", error.message);
          setProductOptions([]);
          return;
        }

        setProductOptions(data || []);
      } catch (error: any) {
        console.warn("Could not load product catalog for purchase orders:", error?.message);
        setProductOptions([]);
      }
    };

    fetchProducts();
  }, [open]);

  const addItem = () => {
    const newItem: POItem = {
      id: `item-${Date.now()}`,
      skuCode: "",
      productName: "",
      category: "",
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof POItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (field === "skuCode" && typeof value === "string") {
            const product = productOptions.find((p) => p.sku_code === value);
            if (product) {
              return {
                ...item,
                skuCode: value,
                productName: product.product_name,
                category: product.category,
                unitPrice: product.sell_price || 0,
              };
            }
            return { ...item, skuCode: value };
          }
          if (field === "quantity" && typeof value === "number") {
            return { ...item, quantity: value };
          }
          if (field === "unitPrice" && typeof value === "number") {
            return { ...item, unitPrice: value };
          }
          if (field === "productName" && typeof value === "string") {
            return { ...item, productName: value };
          }
          if (field === "category" && typeof value === "string") {
            return { ...item, category: value };
          }
          return item;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!supplier.trim()) {
      newErrors.supplier = "Supplier is required";
    }

    if (items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      items.forEach((item, index) => {
        if (!item.skuCode) {
          newErrors[`item-${index}-sku`] = "SKU is required";
        }
        if (item.quantity <= 0) {
          newErrors[`item-${index}-qty`] = "Quantity must be greater than 0";
        }
      });
    }

    if (!expectedDelivery) {
      newErrors.expectedDelivery = "Expected delivery date is required";
    } else {
      const selectedDate = new Date(expectedDelivery);
      const today = new Date();
      if (selectedDate < today) {
        newErrors.expectedDelivery = "Delivery date must be today or in the future";
      }
    }

    if (!paymentTerms) {
      newErrors.paymentTerms = "Payment terms are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const user = await getCurrentUser();
      if (!user) {
        setErrors({ submit: "Please sign in to create purchase orders." });
        return;
      }

      poCounterRef.current += 1;
      const poNumber = `PO-2026-${200 + poCounterRef.current}`;

      const { data, error } = await supabase
        .from("purchase_orders")
        .insert([
          {
            created_by: user.id,
            po_number: poNumber,
            supplier_name: supplier,
            status: "Pending Approval",
            expected_delivery_date: expectedDelivery,
            payment_terms: paymentTerms,
            total_amount: totalAmount,
            notes,
            items_count: items.length,
          },
        ])
        .select();

      if (error) {
        // Check if it's a table not found error
        if (error.message.includes("does not exist") || error.message.includes("purchase_orders")) {
          setErrors({ 
            submit: "Database tables not created yet. Please run the migration SQL in Supabase. See DATABASE_SETUP.md for instructions." 
          });
        } else {
          setErrors({ submit: error.message });
        }
        return;
      }

      setSuccessMessage(`✓ PO ${poNumber} created successfully!`);

      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      setErrors({ submit: "Failed to create purchase order. Please try again." });
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setSupplier("");
    setItems([]);
    setExpectedDelivery("");
    setPaymentTerms("");
    setNotes("");
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="inset-0 h-dvh w-auto max-w-none overflow-x-hidden rounded-none border-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:max-w-2xl sm:border-l sm:border-slate-200"
      >
        <SheetHeader className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div>
            <SheetTitle>Create Purchase Order</SheetTitle>
            <SheetDescription>
              Create a new PO to replenish inventory. Review supplier details, items, pricing, and delivery timeline.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6">
          {successMessage ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 py-12 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-emerald-900">{successMessage}</p>
              <p className="mt-2 text-xs text-emerald-700">Redirecting to purchase orders...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Supplier Section */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Supplier Information
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the supplier name and pull items from the live catalog.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Supplier Name
                  </label>
                  <Input
                    value={supplier}
                    onChange={(e) => {
                      setSupplier(e.target.value);
                      if (errors.supplier) {
                        const newErrors = { ...errors };
                        delete newErrors.supplier;
                        setErrors(newErrors);
                      }
                    }}
                    placeholder="Enter supplier name"
                    className="h-10"
                  />
                  {errors.supplier && (
                    <p className="text-xs text-red-600">{errors.supplier}</p>
                  )}
                </div>
              </section>

              {/* Items Section */}
              <section className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Items & Quantities
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Add items from the live product catalog. Prices auto-populate based on SKU.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    className="h-9 shrink-0 rounded-full px-3 text-xs font-medium text-blue-600"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Item
                  </Button>
                </div>

                {errors.items && (
                  <p className="text-xs text-red-600">{errors.items}</p>
                )}

                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="text-sm text-slate-500">
                        No items added yet. Click &quot;Add Item&quot; to start.
                      </p>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div key={item.id} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-medium text-slate-700">
                              Select Product
                            </label>
                            <Select
                              value={item.skuCode}
                              onValueChange={(value) =>
                                updateItem(item.id, "skuCode", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                  {productOptions.map((product) => (
                                    <SelectItem key={product.sku_code} value={product.sku_code}>
                                      {product.sku_code} - {product.product_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                              {productOptions.length === 0 && (
                                <p className="text-xs text-slate-500">
                                  No products found. Add products in Inventory first.
                                </p>
                              )}
                            {errors[`item-${index}-sku`] && (
                              <p className="text-xs text-red-600">
                                {errors[`item-${index}-sku`]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Quantity
                            </label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, "quantity", parseInt(e.target.value) || 0)
                              }
                              min="1"
                              placeholder="0"
                              className="h-10"
                            />
                            {errors[`item-${index}-qty`] && (
                              <p className="text-xs text-red-600">
                                {errors[`item-${index}-qty`]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Unit Price (PKR)
                            </label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                              className="h-10"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Line Total (PKR)
                            </label>
                            <div className="flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900">
                              {(item.quantity * item.unitPrice).toLocaleString()}
                            </div>
                          </div>

                          {item.productName && (
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-slate-700">
                                Category
                              </label>
                              <div className="flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600">
                                {item.category}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            variant="outline"
                            className="h-8 rounded-full px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        PO Total Amount
                      </span>
                      <span className="text-xl font-semibold text-blue-700">
                        Rs {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              {/* Delivery & Terms Section */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Delivery & Payment
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Set expected delivery date and payment terms.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="expected-delivery">
                      Expected Delivery Date
                    </label>
                    <Input
                      id="expected-delivery"
                      type="date"
                      value={expectedDelivery}
                      onChange={(e) => {
                        setExpectedDelivery(e.target.value);
                        if (errors.expectedDelivery) {
                          const newErrors = { ...errors };
                          delete newErrors.expectedDelivery;
                          setErrors(newErrors);
                        }
                      }}
                    />
                    {errors.expectedDelivery && (
                      <p className="text-xs text-red-600">{errors.expectedDelivery}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Payment Terms
                    </label>
                    <Select
                      value={paymentTerms}
                      onValueChange={(value) => {
                        setPaymentTerms(value);
                        if (errors.paymentTerms) {
                          const newErrors = { ...errors };
                          delete newErrors.paymentTerms;
                          setErrors(newErrors);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTermsOptions.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentTerms && (
                      <p className="text-xs text-red-600">{errors.paymentTerms}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="notes">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any special instructions, delivery address, or notes for the supplier..."
                    className="h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </section>
            </form>
          )}
        </div>

        {!successMessage && (
          <SheetFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {errors.submit ? (
                <span className="text-red-600">{errors.submit}</span>
              ) : successMessage ? (
                <span className="text-emerald-600">{successMessage}</span>
              ) : items.length > 0 ? (
                `${items.length} item${items.length !== 1 ? "s" : ""} • Rs ${totalAmount.toLocaleString()}`
              ) : null}
            </p>
            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
              <SheetClose asChild>
                <Button variant="outline" className="w-full rounded-full px-5">
                  Cancel
                </Button>
              </SheetClose>
              <Button
                onClick={handleSubmit}
                className="w-full rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700"
              >
                Create Purchase Order
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}