import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UserMenu } from "@/components/user-menu";
import { Boxes, ChevronRight, ClipboardList, LayoutDashboard, Mail, Phone, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";

const customerMetrics = [
  { label: "Active Retailers", value: "186", detail: "14 added this month" },
  { label: "Pending Payments", value: "27", detail: "8 overdue this week" },
  { label: "Monthly Orders", value: "1,092", detail: "Across active routes" },
  { label: "Recovery Rate", value: "94.8%", detail: "Last 30 days" },
];

const customers = [
  {
    id: "CUST-0012",
    businessName: "Al-Madina Super Store",
    contactPerson: "Saeed Ahmed",
    phone: "+92 300 1144556",
    email: "almadina.store@example.com",
    cityArea: "Korangi, Karachi",
    status: "Good Standing",
    outstanding: "Rs 0",
    lastOrder: "26 Apr 2026",
  },
  {
    id: "CUST-0048",
    businessName: "City Mart Wholesale",
    contactPerson: "Farhan Qureshi",
    phone: "+92 321 5567788",
    email: "citymart.wholesale@example.com",
    cityArea: "Saddar, Karachi",
    status: "Pending",
    outstanding: "Rs 182,000",
    lastOrder: "25 Apr 2026",
  },
  {
    id: "CUST-0079",
    businessName: "Noor Cash & Carry",
    contactPerson: "Usman Tariq",
    phone: "+92 333 2233445",
    email: "noor.cashcarry@example.com",
    cityArea: "North Nazimabad, Karachi",
    status: "At Risk",
    outstanding: "Rs 364,500",
    lastOrder: "21 Apr 2026",
  },
  {
    id: "CUST-0101",
    businessName: "Pak Fresh Retail",
    contactPerson: "Hina Iqbal",
    phone: "+92 302 9988776",
    email: "pakfresh.retail@example.com",
    cityArea: "Gulshan, Karachi",
    status: "Good Standing",
    outstanding: "Rs 24,000",
    lastOrder: "27 Apr 2026",
  },
];

const statusStyles: Record<string, string> = {
  "Good Standing": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  "At Risk": "bg-red-50 text-red-700 ring-red-100",
};

export default function CustomersPage() {
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
              { label: "Purchase Orders", href: "/purchase-orders", active: false },
              { label: "Customers", href: "/customers", active: true },
              { label: "Reports", href: "#", active: false },
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
              Collections Desk
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Karachi Accounts Unit</p>
                <p className="text-xs text-slate-500">Recovery team online</p>
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
                <span className="font-medium text-slate-800">Customers</span>
              </nav>

              <div className="flex w-full items-center justify-between md:hidden">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Al-Noor Beverages</p>
                  <p className="text-sm font-semibold text-slate-900">Customers</p>
                </div>
                <UserMenu compact />
              </div>

              <div className="relative order-3 w-full md:order-none md:flex-1 md:justify-center">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search customer"
                  placeholder="Search customer name, ID, or phone"
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
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Customer Accounts</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Manage retail partners, monitor outstanding balances, and keep customer operations organized.
                </p>
              </div>

              <Button className="h-11 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                + Register Customer
              </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {customerMetrics.map((metric) => (
                <Card key={metric.label} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="space-y-2 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">{metric.label}</CardTitle>
                    <div className="text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-slate-500">{metric.detail}</CardContent>
                </Card>
              ))}
            </section>

            <Card className="mt-6 border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950">Customer Ledger Overview</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Review customer standing, pending balances, and latest order activity.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Select defaultValue="all">
                      <option value="all">All Cities</option>
                      <option value="karachi">Karachi</option>
                      <option value="lahore">Lahore</option>
                      <option value="islamabad">Islamabad</option>
                    </Select>
                    <Select defaultValue="all-status">
                      <option value="all-status">All Status</option>
                      <option value="good">Good Standing</option>
                      <option value="pending">Pending</option>
                      <option value="risk">At Risk</option>
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
                        <th className="px-6 py-4">Customer ID</th>
                        <th className="px-6 py-4">Business & Contact</th>
                        <th className="px-6 py-4">Area</th>
                        <th className="px-6 py-4">Credit Status</th>
                        <th className="px-6 py-4">Outstanding</th>
                        <th className="px-6 py-4">Last Order</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {customers.map((customer) => {
                        const highOutstanding = customer.status === "At Risk";

                        return (
                          <tr key={customer.id} className="hover:bg-slate-50/80">
                            <td className="whitespace-nowrap px-6 py-4 align-middle text-slate-500">{customer.id}</td>
                            <td className="px-6 py-4 align-middle">
                              <p className="font-medium text-slate-950">{customer.businessName}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <span>{customer.contactPerson}</span>
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  {customer.phone}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {customer.email}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 align-middle text-slate-700">{customer.cityArea}</td>
                            <td className="px-6 py-4 align-middle">
                              <Badge
                                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[customer.status]}`}
                              >
                                {customer.status}
                              </Badge>
                            </td>
                            <td
                              className={`whitespace-nowrap px-6 py-4 align-middle font-semibold ${
                                highOutstanding ? "text-red-600" : "text-slate-900"
                              }`}
                            >
                              {customer.outstanding}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 align-middle text-slate-700">{customer.lastOrder}</td>
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" className="h-9 rounded-full px-4 text-xs">
                                  View Ledger
                                </Button>
                                <Button className="h-9 rounded-full bg-blue-600 px-4 text-xs text-white hover:bg-blue-700">
                                  Record Payment
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {customers.map((customer) => {
                    const highOutstanding = customer.status === "At Risk";

                    return (
                      <div key={customer.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{customer.businessName}</p>
                            <p className="text-xs text-slate-500">{customer.id}</p>
                          </div>
                          <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[customer.status]}`}>
                            {customer.status}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-slate-600">
                          <p>{customer.contactPerson}</p>
                          <p>{customer.phone}</p>
                          <p>{customer.cityArea}</p>
                          <p className="truncate">{customer.email}</p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className={`text-sm font-semibold ${highOutstanding ? "text-red-600" : "text-slate-900"}`}>
                            {customer.outstanding}
                          </p>
                          <p className="text-xs text-slate-500">Last order: {customer.lastOrder}</p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button variant="outline" className="h-9 rounded-full px-3 text-xs">
                            View Ledger
                          </Button>
                          <Button className="h-9 rounded-full bg-blue-600 px-3 text-xs text-white hover:bg-blue-700">
                            Record Payment
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
          <Link href="/purchase-orders" className="flex flex-col items-center gap-1 text-slate-500">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs font-medium">Orders</span>
          </Link>
          <Link href="/customers" className="flex flex-col items-center gap-1 text-blue-700">
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Customers</span>
          </Link>
        </div>
      </nav>
      </div>
    </ProtectedRoute>
  );
}