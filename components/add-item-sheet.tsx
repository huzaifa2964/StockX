"use client";

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

export function AddItemSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl">
        <SheetHeader className="flex items-start justify-between gap-4">
          <div>
            <SheetTitle>Register Beverage</SheetTitle>
            <SheetDescription>
              Add a new item to the Al-Noor Beverages catalog. Keep the product name, stock values, and prices clear and simple.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto px-1 py-4">
          <form className="space-y-8">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Product Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">Use the same naming style the agency uses on cartons and delivery slips.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="product-name">
                    Product Name
                  </label>
                  <Input id="product-name" placeholder="Coca-Cola 1.5L" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soda">Soda</SelectItem>
                      <SelectItem value="Water">Water</SelectItem>
                      <SelectItem value="Juice">Juice</SelectItem>
                      <SelectItem value="Energy Drink">Energy Drink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Unit Type
                  </label>
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Bottle">Single Bottle</SelectItem>
                      <SelectItem value="6-Pack">6-Pack</SelectItem>
                      <SelectItem value="Case of 24">Case of 24</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Input id="initial-stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="minimum-stock">
                    Minimum Stock Warning Level
                  </label>
                  <Input id="minimum-stock" type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="buy-price">
                    Unit Buy Price
                  </label>
                  <Input id="buy-price" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="sell-price">
                    Unit Sell Price
                  </label>
                  <Input id="sell-price" type="number" placeholder="0.00" />
                </div>
              </div>
            </section>
          </form>
        </div>

        <SheetFooter className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">No database action yet. This panel is for Al-Noor data entry only.</p>
          <div className="flex items-center gap-3">
            <SheetClose>
              <Button variant="outline" className="rounded-full px-5">
                Cancel
              </Button>
            </SheetClose>
            <Button className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700">
              Save Item
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}