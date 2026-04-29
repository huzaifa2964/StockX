"use client";

import { AddItemSheet } from "@/components/add-item-sheet";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Boxes, ChevronRight, ClipboardList, Edit3, LayoutDashboard, Minus, Plus, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/app/providers";
import { getCurrentUser, supabase } from "@/lib/supabase";

type ProductRow = {
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unitPrice: string;
  image: string;
  unitPriceValue: number;
};

const categoryStyles: Record<string, string> = {
  Soda: "bg-blue-50 text-blue-700 ring-blue-100",
  Water: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  Juice: "bg-amber-50 text-amber-700 ring-amber-100",
};

function progressPercent(stock: number, minStock: number) {
  return Math.max(8, Math.min(100, Math.round((stock / Math.max(minStock, 1)) * 100)));
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [productsData, setProductsData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setProductsData([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Could not load products from database:", error.message);
          setProductsData([]);
          return;
        }

        // Transform database data to match component format
        const transformed = (data || []).map((product: any) => ({
          sku: product.sku_code,
          name: product.product_name,
          category: product.category,
          stock: product.current_stock,
          minStock: product.minimum_stock,
          unitPrice: `Rs ${(product.sell_price || 0).toLocaleString()}`,
          unitPriceValue: Number(product.sell_price || 0),
          image: product.product_name.substring(0, 2).toUpperCase(),
        }));

        setProductsData(transformed);
      } catch (error: any) {
        console.warn("Could not fetch products from database:", error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAddItemOpen, user?.id]);

  const totalStock = productsData.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = productsData.filter((product) => product.stock <= product.minStock).length;
  const totalValue = productsData.reduce((sum, product) => sum + product.stock * product.unitPriceValue, 0);

  const metrics = [
    { label: "Total Items", value: productsData.length.toString(), detail: "Live catalog rows" },
    { label: "Low Stock Warnings", value: lowStockCount.toString(), detail: "Items at or below minimum" },
    { label: "Total Units in Warehouse", value: totalStock.toLocaleString(), detail: "Across all products" },
    { label: "Total Value", value: `Rs ${totalValue.toLocaleString()}`, detail: "At current sell price" },
  ];

  const productsToDisplay = productsData;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Al-Noor Beverages Distribution
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">Agency Control Desk</h1>
          </div>

          <nav className="space-y-1 text-sm font-medium text-slate-600">
            {[
              { label: "Dashboard", href: "/", active: false },
              { label: "Inventory", href: "/inventory", active: true },
              { label: "Purchase Orders", href: "/purchase-orders", active: false },
              { label: "Customers", href: "/customers", active: false },
              { label: "Sales / Invoices", href: "/sales", active: false },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.label}</span>
                {item.active ? <ChevronRight className="h-4 w-4" /> : null}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
              Warehouse Status
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Sheikhupura Central Depot</p>
                <p className="text-xs text-slate-500">Main warehouse / {productsData.length} live items</p>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <nav className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-slate-800">Inventory</span>
              </nav>

              <div className="flex w-full items-center justify-between md:hidden">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Al-Noor Beverages</p>
                  <p className="text-sm font-semibold text-slate-900">Inventory</p>
                </div>
                <UserMenu compact />
              </div>

              <div className="relative order-3 w-full md:order-none md:flex-1 md:justify-center">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search barcode or item"
                  placeholder="Search barcode, SKU, or product"
                  className="h-11 w-full rounded-full border-slate-200 bg-white pl-9 shadow-sm placeholder:text-slate-400 md:mx-auto md:max-w-xl"
                />
              </div>

              <div className="ml-auto hidden items-center gap-3 md:flex">
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full bg-white">
                  <Settings className="h-4 w-4" />
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
                  Agency Inventory Dashboard
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Monitor stock, catch low inventory early, and keep the Al-Noor warehouse running smoothly across Sheikhupura routes.
                </p>
              </div>

              <Button
                className="h-11 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                onClick={() => setIsAddItemOpen(true)}
              >
                + Register New Item
              </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.label} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="space-y-2 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{metric.label}</CardTitle>
                    <div className="text-3xl font-semibold tracking-tight text-slate-950">
                      {metric.value}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-slate-500">{metric.detail}</CardContent>
                </Card>
              ))}
            </section>

            <Card className="mt-6 border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950">
                      Al-Noor Inventory Overview
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Track item availability, minimum thresholds, and quick stock changes for the agency floor team.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <Edit3 className="h-4 w-4" />
                    Live warehouse adjustments enabled in PKR
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      <tr>
                        <th className="px-6 py-4">SKU / Barcode</th>
                        <th className="px-6 py-4">Product Name &amp; Image</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Stock Level</th>
                        <th className="px-6 py-4">Unit Price</th>
                        <th className="px-6 py-4 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {productsToDisplay.length > 0 ? (
                        productsToDisplay.map((item) => {
                          const lowStock = item.stock < item.minStock;
                          const progress = progressPercent(item.stock, item.minStock);

                          return (
                            <tr key={item.sku} className="hover:bg-slate-50/80">
                              <td className="whitespace-nowrap px-6 py-4 align-middle text-slate-500">
                                {item.sku}
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
                                    aria-hidden="true"
                                  >
                                    {item.image}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-950">{item.name}</p>
                                    <p className="text-xs text-slate-500">Live product record</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <Badge
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${categoryStyles[item.category] || categoryStyles.Soda}`}
                                >
                                  {item.category}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="w-full max-w-xs">
                                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{item.stock} crates in stock</span>
                                    <span
                                      className={
                                        lowStock
                                          ? "font-semibold text-red-600"
                                          : "font-medium text-emerald-600"
                                      }
                                    >
                                      Min {item.minStock}
                                    </span>
                                  </div>
                                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        lowStock
                                          ? "bg-red-500"
                                          : progress < 60
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 align-middle font-medium text-slate-900">
                                {item.unitPrice}
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    aria-label={`Increase stock for ${item.name}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    aria-label={`Decrease stock for ${item.name}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                            {loading ? "Loading inventory from Supabase..." : "No products found in the database yet."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {productsToDisplay.length > 0 ? (
                    productsToDisplay.map((item) => {
                      const lowStock = item.stock < item.minStock;
                      const progress = progressPercent(item.stock, item.minStock);

                      return (
                        <div key={item.sku} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.sku}</p>
                            </div>
                            <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${categoryStyles[item.category] || categoryStyles.Soda}`}>
                              {item.category}
                            </Badge>
                          </div>

                          <div className="mt-3">
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                              <span>{item.stock} crates in stock</span>
                              <span className={lowStock ? "font-semibold text-red-600" : "font-medium text-emerald-600"}>
                                Min {item.minStock}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  lowStock
                                    ? "bg-red-500"
                                    : progress < 60
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">{item.unitPrice}</p>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                      {loading ? "Loading inventory from Supabase..." : "No products found in the database yet."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
        <div className="mx-auto flex w-full max-w-md items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-slate-500">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link href="/inventory" className="flex flex-col items-center gap-1 text-blue-700">
            <Boxes className="h-5 w-5" />
            <span className="text-xs font-medium">Inventory</span>
          </Link>
          <Link href="/purchase-orders" className="flex flex-col items-center gap-1 text-slate-500">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs font-medium">Orders</span>
          </Link>
          <Link href="/customers" className="flex flex-col items-center gap-1 text-slate-500">
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Customers</span>
          </Link>
        </div>
      </nav>

        <AddItemSheet open={isAddItemOpen} onOpenChange={setIsAddItemOpen} />
      </div>
    </ProtectedRoute>
  );
}