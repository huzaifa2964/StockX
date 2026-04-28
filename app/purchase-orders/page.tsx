"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CreatePurchaseOrderSheet } from "@/components/create-purchase-order-sheet";

const poMetrics = [
  { label: "Open Purchase Orders", value: "42", detail: "11 require approval" },
  { label: "Expected This Week", value: "Rs 28.7M", detail: "From 9 suppliers" },
  { label: "Received On Time", value: "91%", detail: "Last 30 days" },
  { label: "Pending GRN", value: "6", detail: "Warehouse action needed" },
];

const monthlyPurchase = [54, 61, 59, 66, 70, 76, 73, 79, 84, 81, 88, 93];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const orders = [
  {
    poNo: "PO-2026-188",
    supplier: "Continental Beverages Ltd",
    category: "Soda",
    amount: "Rs 4,280,000",
    status: "Approved",
    expected: "30 Apr 2026",
  },
  {
    poNo: "PO-2026-191",
    supplier: "Aqua Pure Pakistan",
    category: "Water",
    amount: "Rs 2,950,000",
    status: "In Transit",
    expected: "02 May 2026",
  },
  {
    poNo: "PO-2026-194",
    supplier: "Fresh Valley Juices",
    category: "Juice",
    amount: "Rs 1,760,000",
    status: "Pending Approval",
    expected: "04 May 2026",
  },
  {
    poNo: "PO-2026-196",
    supplier: "Energy Rush Pvt Ltd",
    category: "Energy",
    amount: "Rs 3,120,000",
    status: "Received",
    expected: "28 Apr 2026",
  },
];

const statusStyle: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "In Transit": "bg-blue-50 text-blue-700 ring-blue-100",
  "Pending Approval": "bg-amber-50 text-amber-700 ring-amber-100",
  Received: "bg-slate-100 text-slate-700 ring-slate-200",
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

const purchaseTrendPoints = linePoints(monthlyPurchase);

export default function PurchaseOrdersPage() {
  const [createPoOpen, setCreatePoOpen] = useState(false);

  return (
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
              { label: "Reports", href: "#", active: false },
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
              <span className="font-semibold text-blue-700">5</span>
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
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white">
                  <Settings className="h-4 w-4" />
                </Button>
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
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
                  <UserCircle2 className="h-8 w-8 text-slate-400" />
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-slate-900">Ahsan Malik</p>
                    <p className="text-xs text-slate-500">Agency Manager</p>
                  </div>
                </div>
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
                        points={purchaseTrendPoints}
                      />
                    </svg>
                  </div>
                  <div className="mt-3 grid grid-cols-6 gap-2 text-xs text-slate-500 sm:grid-cols-12">
                    {months.map((month) => (
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
                    <span className="font-semibold text-slate-900">11</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <Truck className="h-4 w-4 text-blue-600" />
                      In Transit
                    </div>
                    <span className="font-semibold text-slate-900">9</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <CircleCheckBig className="h-4 w-4 text-emerald-600" />
                      Received
                    </div>
                    <span className="font-semibold text-slate-900">22</span>
                  </div>
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
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Expected Delivery</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {orders.map((order) => (
                        <tr key={order.poNo} className="hover:bg-slate-50/80">
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">{order.poNo}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{order.supplier}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-700">{order.category}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">{order.amount}</td>
                          <td className="px-6 py-4">
                            <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyle[order.status]}`}>
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
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {orders.map((order) => (
                    <div key={order.poNo} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{order.poNo}</p>
                          <p className="text-xs text-slate-500">{order.supplier}</p>
                        </div>
                        <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyle[order.status]}`}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <p>Category: {order.category}</p>
                        <p>Amount: {order.amount}</p>
                        <p className="col-span-2">Expected: {order.expected}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-9 rounded-full px-3 text-xs">View</Button>
                        <Button className="h-9 rounded-full bg-blue-600 px-3 text-xs text-white hover:bg-blue-700">Update</Button>
                      </div>
                    </div>
                  ))}
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
  );
}
