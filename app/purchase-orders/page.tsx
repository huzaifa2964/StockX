"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UserMenu } from "@/components/user-menu";
import {
  Boxes,
  ChevronRight,
  CircleCheckBig,
  CircleDashed,
  ClipboardList,
  LayoutDashboard,
  Search,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CreatePurchaseOrderSheet } from "@/components/create-purchase-order-sheet";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/app/providers";
import { getCurrentUser, supabase } from "@/lib/supabase";

const statusStyle: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "In Transit": "bg-blue-50 text-blue-700 ring-blue-100",
  "Pending Approval": "bg-amber-50 text-amber-700 ring-amber-100",
  Received: "bg-slate-100 text-slate-700 ring-slate-200",
};

type PurchaseOrderRow = {
  id: string;
  poNo: string;
  supplier: string;
  amount: number;
  amountLabel: string;
  status: string;
  expected: string;
  expectedDate: string | null;
  itemsCount: number;
  notes: string;
  createdAt: string | null;
};

function linePoints(values: number[]) {
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

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const [createPoOpen, setCreatePoOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setPurchaseOrders([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("purchase_orders")
          .select("id, po_number, supplier_name, status, expected_delivery_date, total_amount, items_count, notes, created_at")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Could not load purchase orders from database:", error.message);
          setPurchaseOrders([]);
          return;
        }

        const transformed = (data || []).map((order: any) => ({
          id: order.id,
          poNo: order.po_number,
          supplier: order.supplier_name,
          amount: Number(order.total_amount || 0),
          amountLabel: `Rs ${(order.total_amount || 0).toLocaleString()}`,
          status: order.status || "Pending Approval",
          expectedDate: order.expected_delivery_date || null,
          expected: order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) : "TBD",
          itemsCount: Number(order.items_count || 0),
          notes: order.notes || "",
          createdAt: order.created_at || null,
        }));

        setPurchaseOrders(transformed);
      } catch (error: any) {
        console.warn("Could not load purchase orders from database:", error?.message);
        setPurchaseOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrders();
  }, [createPoOpen, user?.id]);

  const orderPipeline = {
    pending: purchaseOrders.filter((order) => order.status === "Pending Approval").length,
    transit: purchaseOrders.filter((order) => order.status === "In Transit").length,
    received: purchaseOrders.filter((order) => order.status === "Received" || order.status === "Approved").length,
  };

  const openPurchaseOrders = purchaseOrders.filter((order) => order.status !== "Received").length;
  const today = new Date();
  const weekAhead = new Date();
  weekAhead.setDate(today.getDate() + 7);

  const expectedThisWeek = purchaseOrders.reduce((sum, order) => {
    if (!order.expectedDate) return sum;

    const expectedDate = new Date(order.expectedDate);
    if (Number.isNaN(expectedDate.getTime())) return sum;

    return expectedDate >= today && expectedDate <= weekAhead ? sum + order.amount : sum;
  }, 0);
  const receivedRate = purchaseOrders.length > 0
    ? Math.round((orderPipeline.received / purchaseOrders.length) * 100)
    : 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTotals = monthNames.map((month, index) => {
    const total = purchaseOrders.reduce((sum, order) => {
      if (!order.createdAt) return sum;
      const createdAt = new Date(order.createdAt);
      return createdAt.getMonth() === index ? sum + order.amount : sum;
    }, 0);

    return { month, value: total / 1000000 };
  });

  const monthlyTrendPoints = linePoints(monthlyTotals.map((item) => item.value));

  const suppliers = purchaseOrders.reduce<Record<string, { count: number; amount: number }>>((accumulator, order) => {
    const current = accumulator[order.supplier] || { count: 0, amount: 0 };
    current.count += 1;
    current.amount += order.amount;
    accumulator[order.supplier] = current;
    return accumulator;
  }, {});

  const topSuppliers = Object.entries(suppliers)
    .map(([supplier, stats]) => ({ supplier, ...stats }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 4);

  const alerts = [
    ...purchaseOrders
      .filter((order) => order.status === "Pending Approval")
      .slice(0, 2)
      .map((order) => ({
        id: order.poNo,
        title: `${order.poNo} awaiting approval`,
        severity: "Medium",
        time: order.notes || "Pending review",
      })),
    ...purchaseOrders
      .filter((order) => order.status === "In Transit")
      .slice(0, 1)
      .map((order) => ({
        id: order.poNo,
        title: `${order.poNo} in transit`,
        severity: "Low",
        time: order.expected,
      })),
  ];

  const poMetrics = [
    { label: "Open Purchase Orders", value: openPurchaseOrders.toString(), detail: `${orderPipeline.pending} require approval` },
    { label: "Expected This Week", value: `Rs ${expectedThisWeek.toLocaleString()}`, detail: "Orders due in the next 7 days" },
    { label: "Received Rate", value: `${receivedRate}%`, detail: "Based on live PO statuses" },
    { label: "Pending GRN", value: orderPipeline.pending.toString(), detail: "Warehouse action needed" },
  ];

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
              { label: "Inventory", href: "/inventory", active: false },
              { label: "Purchase Orders", href: "/purchase-orders", active: true },
              { label: "Customers", href: "/customers", active: false },
              { label: "Sales / Invoices", href: "/sales", active: false },
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
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
              Supplier Dispatch
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">Trucks in transit</span>
              <span className="font-semibold text-blue-700">
                {purchaseOrders.filter((order) => order.status === "In Transit").length}
              </span>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <nav className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-slate-800">Purchase Orders</span>
              </nav>

              <div className="flex w-full items-center justify-between md:hidden">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Al-Noor Beverages</p>
                  <p className="text-sm font-semibold text-slate-900">Purchase Orders</p>
                </div>
                <UserMenu compact />
              </div>

              <div className="relative order-3 w-full md:order-none md:flex-1 md:justify-center">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search purchase order"
                  placeholder="Search PO number, supplier, or category"
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
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Purchase Orders</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Track supplier purchase cycles, approval status, and inbound stock timelines in one clear workflow.
                </p>
              </div>

              <Button
                onClick={() => setCreatePoOpen(true)}
                className="h-11 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Create Purchase Order
              </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {poMetrics.map((metric) => (
                <Card key={metric.label} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="space-y-2 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{metric.label}</CardTitle>
                    <div className="text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-slate-500">{metric.detail}</CardContent>
                </Card>
              ))}
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card className="border-slate-200 bg-white shadow-sm lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Monthly Purchase Value Trend (PKR Mn)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-52 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Purchase trend chart">
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={monthlyTrendPoints}
                      />
                    </svg>
                  </div>
                  <div className="mt-3 grid grid-cols-6 gap-2 text-xs text-slate-500 sm:grid-cols-12">
                    {monthNames.map((month) => (
                      <span key={month} className="text-center">{month}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Order Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <CircleDashed className="h-4 w-4 text-amber-500" />
                      Pending Approval
                    </div>
                    <span className="font-semibold text-slate-900">{orderPipeline.pending}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <Truck className="h-4 w-4 text-blue-600" />
                      In Transit
                    </div>
                    <span className="font-semibold text-slate-900">{orderPipeline.transit}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <CircleCheckBig className="h-4 w-4 text-emerald-600" />
                      Received
                    </div>
                    <span className="font-semibold text-slate-900">{orderPipeline.received}</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Top Suppliers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topSuppliers.length > 0 ? (
                    topSuppliers.map((supplier) => (
                      <div key={supplier.supplier}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                          <span>{supplier.supplier}</span>
                          <span className="font-medium text-slate-700">{supplier.count} orders</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min((supplier.amount / Math.max(expectedThisWeek, 1)) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No supplier data available yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-950">Operational Alerts</CardTitle>
                    <Badge className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100">
                      {alerts.length} active alerts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                          <p className="text-xs text-slate-500">{alert.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-slate-500">{alert.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No current purchase-order alerts.</p>
                  )}
                </CardContent>
              </Card>
            </section>

            <Card className="mt-6 border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950">Purchase Order Tracker</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Review approvals, expected arrival dates, and vendor exposure.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Select defaultValue="all-suppliers">
                      <option value="all-suppliers">All Suppliers</option>
                      <option value="beverage">Beverage Suppliers</option>
                      <option value="water">Water Suppliers</option>
                    </Select>
                    <Select defaultValue="all-status">
                      <option value="all-status">All Status</option>
                      <option value="pending">Pending Approval</option>
                      <option value="transit">In Transit</option>
                      <option value="received">Received</option>
                    </Select>
                    <Select defaultValue="30-days">
                      <option value="30-days">Last 30 Days</option>
                      <option value="7-days">Last 7 Days</option>
                      <option value="90-days">Last 90 Days</option>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <tr>
                        <th className="px-6 py-4">PO Number</th>
                        <th className="px-6 py-4">Supplier</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Expected Delivery</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {purchaseOrders.length > 0 ? (
                        purchaseOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/80">
                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">{order.poNo}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{order.supplier}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-slate-700">{order.itemsCount} items</td>
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{order.amountLabel}</td>
                            <td className="px-6 py-4">
                              <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyle[order.status] || statusStyle["Pending Approval"]}`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-slate-700">{order.expected}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" className="h-9 rounded-full px-4 text-xs">View</Button>
                                <Button className="h-9 rounded-full bg-blue-600 px-4 text-xs text-white hover:bg-blue-700">Update</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                            {loading ? "Loading purchase orders from Supabase..." : "No purchase orders found in the database yet."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{order.poNo}</p>
                            <p className="text-xs text-slate-500">{order.supplier}</p>
                          </div>
                          <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyle[order.status] || statusStyle["Pending Approval"]}`}>
                            {order.status}
                          </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <p>Items: {order.itemsCount}</p>
                          <p>Amount: {order.amountLabel}</p>
                          <p className="col-span-2">Expected: {order.expected}</p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button variant="outline" className="h-9 rounded-full px-3 text-xs">View</Button>
                          <Button className="h-9 rounded-full bg-blue-600 px-3 text-xs text-white hover:bg-blue-700">Update</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                      {loading ? "Loading purchase orders from Supabase..." : "No purchase orders found in the database yet."}
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
          <Link href="/inventory" className="flex flex-col items-center gap-1 text-slate-500">
            <Boxes className="h-5 w-5" />
            <span className="text-xs font-medium">Inventory</span>
          </Link>
          <Link href="/purchase-orders" className="flex flex-col items-center gap-1 text-blue-700">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs font-medium">Orders</span>
          </Link>
          <Link href="/customers" className="flex flex-col items-center gap-1 text-slate-500">
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Customers</span>
          </Link>
        </div>
      </nav>

        <CreatePurchaseOrderSheet
          open={createPoOpen}
          onOpenChange={setCreatePoOpen}
        />
      </div>
    </ProtectedRoute>
  );
}
