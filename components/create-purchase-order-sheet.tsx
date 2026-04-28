"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

interface POItem {
  id: string;
  skuCode: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

interface FormErrors {
  [key: string]: string;
}

const supplierOptions = [
  "Continental Beverages Ltd",
  "Aqua Pure Pakistan",
  "Fresh Valley Juices",
  "Energy Rush Pvt Ltd",
  "Mountain Springs Water",
  "Tropical Fruit Juice Co",
];

const productCatalog = [
  { sku: "COLA-1.5L", name: "Coca-Cola 1.5L", category: "Soda", unitPrice: 185 },
  { sku: "COLA-2.5L", name: "Coca-Cola 2.5L", category: "Soda", unitPrice: 295 },
  { sku: "SPRITE-1.5L", name: "Sprite 1.5L", category: "Soda", unitPrice: 175 },
  { sku: "FANTA-1.5L", name: "Fanta Orange 1.5L", category: "Soda", unitPrice: 165 },
  { sku: "WATER-1.5L", name: "Aqua Pure 1.5L", category: "Water", unitPrice: 120 },
  { sku: "WATER-5L", name: "Aqua Pure 5L", category: "Water", unitPrice: 380 },
  { sku: "JUICE-1L", name: "Fresh Orange Juice 1L", category: "Juice", unitPrice: 220 },
  { sku: "ENERGY-500ML", name: "Energy Rush 500ML", category: "Energy", unitPrice: 350 },
];

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
  const poCounterRef = useRef(0);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<POItem[]>([]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Add new item row
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

  // Update item field
  const updateItem = (id: string, field: keyof POItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (field === "skuCode" && typeof value === "string") {
            const product = productCatalog.find((p) => p.sku === value);
            if (product) {
              return {
                ...item,
                skuCode: value,
                productName: product.name,
                category: product.category,
                unitPrice: product.unitPrice,
              };
            }
          }
          if (field === "skuCode" && typeof value === "string") {
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

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Validate form
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

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Generate PO number (using counter for uniqueness)
    poCounterRef.current += 1;
    const poNumber = `PO-2026-${200 + poCounterRef.current}`;

    // Prepare PO data
    const poData = {
      poNumber,
      supplier,
      items: items.length,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      amount: `Rs ${totalAmount.toLocaleString()}`,
      status: "Pending Approval",
      expectedDelivery,
      paymentTerms,
      notes,
      createdDate: new Date().toLocaleDateString("en-PK"),
    };

    console.log("Purchase Order Created:", poData);

    // Show success message
    setSuccessMessage(`PO ${poNumber} created successfully!`);

    // Reset form after 2 seconds
    setTimeout(() => {
      resetForm();
      onOpenChange(false);
    }, 2000);
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
      <SheetContent side="right" className="w-full max-w-2xl">
        <SheetHeader className="flex items-start justify-between gap-4">
          <div>
            <SheetTitle>Create Purchase Order</SheetTitle>
            <SheetDescription>
              Create a new PO to replenish inventory. Review supplier details, items, pricing, and delivery timeline.
            </SheetDescription>
          </div>
          <SheetCloseButton />
        </SheetHeader>

        <SheetBody>
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
                    Select the supplier and review their contact details.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="supplier">
                    Supplier Name
                  </label>
                  <Select
                    id="supplier"
                    value={supplier}
                    onChange={(e) => {
                      setSupplier(e.target.value);
                      if (errors.supplier) {
                        const newErrors = { ...errors };
                        delete newErrors.supplier;
                        setErrors(newErrors);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select supplier
                    </option>
                    {supplierOptions.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </Select>
                  {errors.supplier && (
                    <p className="text-xs text-red-600">{errors.supplier}</p>
                  )}
                </div>
              </section>

              {/* Items Section */}
              <section className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Items & Quantities
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Add items from the catalog. Prices auto-populate based on SKU.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    className="h-9 rounded-full px-3 text-xs font-medium text-blue-600"
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
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-medium text-slate-700">
                              Select Product
                            </label>
                            <Select
                              value={item.skuCode}
                              onChange={(e) =>
                                updateItem(item.id, "skuCode", e.target.value)
                              }
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Select product
                              </option>
                              {productCatalog.map((product) => (
                                <option key={product.sku} value={product.sku}>
                                  {product.sku} - {product.name}
                                </option>
                              ))}
                            </Select>
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
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
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
                                updateItem(
                                  item.id,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
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
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="expected-delivery"
                    >
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
                      <p className="text-xs text-red-600">
                        {errors.expectedDelivery}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="payment-terms"
                    >
                      Payment Terms
                    </label>
                    <Select
                      id="payment-terms"
                      value={paymentTerms}
                      onChange={(e) => {
                        setPaymentTerms(e.target.value);
                        if (errors.paymentTerms) {
                          const newErrors = { ...errors };
                          delete newErrors.paymentTerms;
                          setErrors(newErrors);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select payment terms
                      </option>
                      {paymentTermsOptions.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </Select>
                    {errors.paymentTerms && (
                      <p className="text-xs text-red-600">
                        {errors.paymentTerms}
                      </p>
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
                    placeholder="Enter any special instructions, delivery address, or notes for the supplier&hellip;"
                    className="h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </section>
            </form>
          )}
        </SheetBody>

        {!successMessage && (
          <SheetFooter className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {items.length > 0 && `${items.length} item${items.length !== 1 ? "s" : ""} • Rs ${totalAmount.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-3">
              <SheetClose>
                <Button variant="outline" className="rounded-full px-5">
                  Cancel
                </Button>
              </SheetClose>
              <Button
                onClick={handleSubmit}
                className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700"
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
