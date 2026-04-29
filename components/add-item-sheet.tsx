"use client";

import { useState } from "react";
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
import { useAuth } from "@/app/providers";
import { getCurrentUser, supabase } from "@/lib/supabase";

export function AddItemSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [unitType, setUnitType] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!unitType.trim()) {
      newErrors.unitType = "Unit type is required";
    }

    if (!initialStock.trim()) {
      newErrors.initialStock = "Initial stock is required";
    } else if (isNaN(Number(initialStock))) {
      newErrors.initialStock = "Initial stock must be a number";
    }

    if (!minimumStock.trim()) {
      newErrors.minimumStock = "Minimum stock is required";
    } else if (isNaN(Number(minimumStock))) {
      newErrors.minimumStock = "Minimum stock must be a number";
    }

    if (!buyPrice.trim()) {
      newErrors.buyPrice = "Buy price is required";
    } else if (isNaN(Number(buyPrice))) {
      newErrors.buyPrice = "Buy price must be a number";
    }

    if (!sellPrice.trim()) {
      newErrors.sellPrice = "Sell price is required";
    } else if (isNaN(Number(sellPrice))) {
      newErrors.sellPrice = "Sell price must be a number";
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
        setErrors({ submit: "Please sign in to add inventory items." });
        return;
      }

      // Generate SKU from product name and timestamp
      const skuBase = productName
        .replace(/\s+/g, "-")
        .toUpperCase()
        .substring(0, 10);
      const sku = `${skuBase}-${Date.now().toString().slice(-5)}`;

      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            created_by: user.id,
            sku_code: sku,
            product_name: productName,
            category,
            unit_type: unitType,
            buy_price: parseFloat(buyPrice),
            sell_price: parseFloat(sellPrice),
            current_stock: parseInt(initialStock),
            minimum_stock: parseInt(minimumStock),
          },
        ])
        .select();

      if (error) {
        // Check if it's a table not found error
        if (error.message.includes("does not exist") || error.message.includes("products")) {
          setErrors({
            submit: "Database tables not created yet. Please run the migration SQL in Supabase. See DATABASE_SETUP.md for instructions."
          });
        } else {
          setErrors({ submit: error.message });
        }
        return;
      }

      setSuccessMessage("✓ Item registered successfully!");
      setTimeout(() => {
        onOpenChange(false);
        setProductName("");
        setCategory("");
        setUnitType("");
        setInitialStock("");
        setBuyPrice("");
        setSellPrice("");
        setSuccessMessage("");
        setErrors({});
      }, 1000);
    } catch (error: any) {
      setErrors({ submit: "Failed to register item. Please try again." });
      console.error("Error:", error);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="inset-0 h-dvh w-auto max-w-none overflow-x-hidden rounded-none border-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:max-w-xl sm:border-l sm:border-slate-200"
      >
        <SheetHeader className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div>
            <SheetTitle>Register Beverage</SheetTitle>
            <SheetDescription>
              Add a new item to the StockX catalog. Keep the product name, stock values, and prices clear and simple.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6">
          <form className="space-y-8">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Product Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">Use the same naming style the agency uses on cartons and delivery slips.</p>
              </div>

              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="product-name">
                    Product Name
                  </label>
                  <Input
                    id="product-name"
                    placeholder="Coca-Cola 1.5L"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={errors.productName ? "border-red-500" : ""}
                  />
                  {errors.productName && (
                    <p className="text-xs text-red-600">{errors.productName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soda">Soda</SelectItem>
                      <SelectItem value="Water">Water</SelectItem>
                      <SelectItem value="Juice">Juice</SelectItem>
                      <SelectItem value="Energy Drink">Energy Drink</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-red-600">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Unit Type
                  </label>
                  <Select value={unitType} onValueChange={setUnitType}>
                    <SelectTrigger className={errors.unitType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Bottle">Single Bottle</SelectItem>
                      <SelectItem value="6-Pack">6-Pack</SelectItem>
                      <SelectItem value="Case of 24">Case of 24</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.unitType && (
                    <p className="text-xs text-red-600">{errors.unitType}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Stock & Pricing
                </h3>
                <p className="mt-1 text-sm text-slate-500">Set the starting stock and keep pricing easy for agency staff to compare.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="initial-stock">
                    Initial Stock Quantity
                  </label>
                  <Input
                    id="initial-stock"
                    type="number"
                    placeholder="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className={errors.initialStock ? "border-red-500" : ""}
                  />
                  {errors.initialStock && (
                    <p className="text-xs text-red-600">{errors.initialStock}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="minimum-stock">
                    Minimum Stock Warning Level
                  </label>
                  <Input
                    id="minimum-stock"
                    type="number"
                    placeholder="0"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(e.target.value)}
                    className={errors.minimumStock ? "border-red-500" : ""}
                  />
                  {errors.minimumStock && (
                    <p className="text-xs text-red-600">{errors.minimumStock}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="buy-price">
                    Unit Buy Price
                  </label>
                  <Input
                    id="buy-price"
                    type="number"
                    placeholder="0.00"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className={errors.buyPrice ? "border-red-500" : ""}
                  />
                  {errors.buyPrice && (
                    <p className="text-xs text-red-600">{errors.buyPrice}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="sell-price">
                    Unit Sell Price
                  </label>
                  <Input
                    id="sell-price"
                    type="number"
                    placeholder="0.00"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className={errors.sellPrice ? "border-red-500" : ""}
                  />
                  {errors.sellPrice && (
                    <p className="text-xs text-red-600">{errors.sellPrice}</p>
                  )}
                </div>
              </div>
            </section>
          </form>
        </div>

        <SheetFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="w-full text-sm text-slate-500 sm:w-auto">
            {errors.submit ? (
              <span className="text-red-600">{errors.submit}</span>
            ) : successMessage ? (
              <span className="text-emerald-600">{successMessage}</span>
            ) : (
              "Item details will be saved to the inventory system."
            )}
          </p>
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <SheetClose asChild>
              <Button variant="outline" className="w-full rounded-full px-5">
                Cancel
              </Button>
            </SheetClose>
            <Button onClick={handleSubmit} className="w-full rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700">
              Save Item
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}