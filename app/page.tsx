"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Boxes,
  ChevronRight,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Search,
  Settings,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/app/providers";

import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  sell_price: number | null;
};

type CustomerRow = {
  id: string;
  business_name: string;
  outstanding_balance: number | null;
  credit_limit: number | null;
  status: string | null;
};

type PurchaseOrderRow = {
  id: string;
  po_number: string;
  status: string | null;
  total_amount: number | null;
  expected_delivery_date: string | null;
  created_at: string | null;
  supplier_name: string;
};

function computeLinePoints(values: number[]) {
  const max = Math.max(...values);
  const min = Math.min(...values);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = ((max - value) / Math.max(max - min, 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

function categoryGradient(mix: Array<{ label: string; value: number; color: string }>) {
  let start = 0;

  const stops = mix.map((item) => {
    const end = start + item.value;
    const stop = `${item.color} ${start}% ${end}%`;
    start = end;
    return stop;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [productsData, setProductsData] = useState<ProductRow[]>([]);
  const [customersData, setCustomersData] = useState<CustomerRow[]>([]);
  const [purchaseOrdersData, setPurchaseOrdersData] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          setProductsData([]);
          setCustomersData([]);
          setPurchaseOrdersData([]);
          setLoading(false);
          return;
        }

        const [productsResult, customersResult, ordersResult] = await Promise.all([
          supabase.from("products").select("id, sku_code, product_name, category, current_stock, minimum_stock, sell_price").eq("created_by", user.id),
          supabase.from("customers").select("id, business_name, outstanding_balance, credit_limit, status").eq("created_by", user.id),
          supabase.from("purchase_orders").select("id, po_number, status, total_amount, expected_delivery_date, created_at, supplier_name").eq("created_by", user.id),
        ]);

        if (productsResult.error) {
          console.warn("Could not load dashboard products:", productsResult.error.message);
          setProductsData([]);
        } else {
          setProductsData((productsResult.data as ProductRow[]) || []);
        }

        if (customersResult.error) {
          console.warn("Could not load dashboard customers:", customersResult.error.message);
          setCustomersData([]);
        } else {
          setCustomersData((customersResult.data as CustomerRow[]) || []);
        }

        if (ordersResult.error) {
          console.warn("Could not load dashboard purchase orders:", ordersResult.error.message);
          setPurchaseOrdersData([]);
        } else {
          setPurchaseOrdersData((ordersResult.data as PurchaseOrderRow[]) || []);
        }
      } catch (error: any) {
        console.warn("Could not load dashboard data:", error?.message);
        setProductsData([]);
        setCustomersData([]);
        setPurchaseOrdersData([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const lowStockItems = productsData.filter((product) => product.current_stock <= product.minimum_stock);
  const openPurchaseOrders = purchaseOrdersData.filter((order) => (order.status || "Pending Approval") !== "Received").length;
  const purchaseVolume = purchaseOrdersData.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const maxLowStockShortage = Math.max(
    ...lowStockItems.map((product) => Math.max(product.minimum_stock - product.current_stock, 0)),
    1
  );

  const kpiCards = [
    { label: "Catalog Items", value: productsData.length.toString(), delta: `${lowStockItems.length} low stock items` },
    { label: "Active Customers", value: customersData.length.toString(), delta: `${customersData.filter((customer) => customer.status === "Good Standing").length} healthy accounts` },
    { label: "Open Purchase Orders", value: openPurchaseOrders.toString(), delta: `${purchaseOrdersData.filter((order) => (order.status || "") === "Pending Approval").length} awaiting approval` },
    { label: "Purchase Volume", value: `Rs ${purchaseVolume.toLocaleString()}`, delta: loading ? "Loading live data" : "From Supabase records" },
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySales = monthNames.map((_, index) =>
    purchaseOrdersData.reduce((sum, order) => {
      if (!order.created_at) return sum;
      const createdAt = new Date(order.created_at);
      return createdAt.getMonth() === index ? sum + Number(order.total_amount || 0) / 1000000 : sum;
    }, 0)
  );
  const salesMonths = monthNames;
  const linePoints = computeLinePoints(monthlySales);

  const categoryMix = Object.entries(
    productsData.reduce<Record<string, number>>((accumulator, product) => {
      accumulator[product.category] = (accumulator[product.category] || 0) + 1;
      return accumulator;
    }, {})
  ).map(([label, count], index, entries) => ({
    label,
    value: entries.length > 0 ? (count / entries.reduce((sum, [, value]) => sum + value, 0)) * 100 : 0,
    color: ["#2563eb", "#06b6d4", "#f59e0b", "#ef4444"][index % 4],
  }));

  const collectionProgress = customersData
    .filter((customer) => Number(customer.credit_limit || 0) > 0)
    .sort((left, right) => Number(right.outstanding_balance || 0) / Number(right.credit_limit || 1) - Number(left.outstanding_balance || 0) / Number(left.credit_limit || 1))
    .slice(0, 4)
    .map((customer) => {
      const creditLimit = Number(customer.credit_limit || 0);
      const outstandingBalance = Number(customer.outstanding_balance || 0);
      const ratio = creditLimit > 0 ? Math.round((outstandingBalance / creditLimit) * 100) : 0;

      return {
        id: customer.id,
        week: customer.business_name,
        target: 100,
        actual: Math.min(ratio, 100),
      };
    });

  const lowStockRoutes = lowStockItems.slice(0, 4).map((product) => ({
    id: product.id,
    route: product.product_name,
    items: Math.max(product.minimum_stock - product.current_stock, 0),
  }));

  const alerts = [
    ...lowStockItems.slice(0, 2).map((product) => ({
      id: product.sku_code,
      title: `${product.product_name} is below minimum stock`,
      severity: "High",
      time: `${product.current_stock} on hand`,
    })),
    ...purchaseOrdersData
      .filter((order) => (order.status || "") === "Pending Approval")
      .slice(0, 1)
      .map((order) => ({
        id: order.po_number,
        title: `${order.po_number} awaiting approval`,
        severity: "Medium",
        time: order.supplier_name,
      })),
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-8">
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Control Desk</h2>
          </div>

          <nav className="space-y-1 text-sm font-medium text-slate-600">
            {[
              { label: "Dashboard", href: "/", active: true },
              { label: "Inventory", href: "/inventory", active: false },
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
              Today Snapshot
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Orders Processed</span>
                <span className="font-semibold text-slate-900">
                  {purchaseOrdersData.filter((order) => (order.status || "") === "Received").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Dispatch Accuracy</span>
                <span className="font-semibold text-emerald-600">
                  {purchaseOrdersData.length > 0
                    ? `${Math.round((purchaseOrdersData.filter((order) => (order.status || "") === "Received").length / purchaseOrdersData.length) * 100)}%`
                    : "0%"}
                </span>
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
                <span className="font-medium text-slate-800">Overview</span>
              </nav>

              <div className="flex w-full items-center justify-between md:hidden">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">StockX</p>
                  <p className="text-sm font-semibold text-slate-900">Dashboard</p>
                </div>
                <UserMenu compact />
              </div>

              <div className="relative order-3 w-full md:order-none md:flex-1 md:justify-center">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search dashboard"
                  placeholder="Search item, customer, route, or invoice"
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
                <p className="text-sm font-medium text-slate-500">StockX</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                  Executive Dashboard
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Central view of revenue, stock health, collections, and operational alerts for faster daily decisions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-11 rounded-full px-5 text-sm">
                  Export Report
                </Button>
                <Link href="/sales" className="inline-flex h-11 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
                  Open Sales
                </Link>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((item) => (
                <Card key={item.label} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{item.label}</CardTitle>
                    <div className="text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-emerald-600">{item.delta}</CardContent>
                </Card>
              ))}
            </section>

            <section className="mt-6 grid gap-4 xl:grid-cols-3">
              <Card className="border-slate-200 bg-white shadow-sm xl:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Monthly Order Value Trend (PKR Mn)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Monthly sales trend chart">
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={linePoints}
                      />
                    </svg>
                  </div>
                  <div className="mt-3 grid grid-cols-6 gap-2 text-xs text-slate-500 sm:grid-cols-12">
                    {salesMonths.map((month) => (
                      <span key={month} className="text-center">{month}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Catalog Category Mix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mx-auto h-44 w-44 rounded-full" style={{ background: categoryGradient(categoryMix) }}>
                    <div className="m-auto mt-7 h-30 w-30 rounded-full bg-white" />
                  </div>
                  <div className="mt-5 space-y-2">
                    {categoryMix.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600">{item.label}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{Math.round(item.value)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Top Credit Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {collectionProgress.map((item) => (
                    <div key={item.id}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.week}</span>
                        <span className="font-medium text-slate-700">{item.actual}% utilized</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${item.actual >= item.target ? "bg-emerald-500" : "bg-blue-600"}`}
                          style={{ width: `${Math.min(item.actual, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Low Stock Watchlist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lowStockRoutes.map((item) => (
                    <div key={item.id}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.route}</span>
                        <span className="font-medium text-red-600">{item.items} items</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.max((item.items / maxLowStockShortage) * 100, 8)}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <Card className="mt-6 border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-950">Operational Alerts</CardTitle>
                  <Badge className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100">
                    {alerts.length} active alerts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                        <p className="text-xs text-slate-500">{alert.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                        {alert.severity}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
        <div className="mx-auto flex w-full max-w-md items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-blue-700">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link href="/inventory" className="flex flex-col items-center gap-1 text-slate-500">
            <Boxes className="h-5 w-5" />
            <span className="text-xs font-medium">Inventory</span>
          </Link>
          <Link href="/sales" className="flex flex-col items-center gap-1 text-blue-700">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs font-medium">Sales</span>
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
      </div>
    </ProtectedRoute>
  );
}
