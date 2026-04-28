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
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";

const kpiCards = [
  { label: "Monthly Revenue", value: "Rs 86.4M", delta: "+12.8% vs last month" },
  { label: "Gross Margin", value: "18.6%", delta: "+1.4% improvement" },
  { label: "Inventory Turnover", value: "6.2x", delta: "Healthy stock movement" },
  { label: "Collection Efficiency", value: "94.8%", delta: "On-track for quarter target" },
];

const monthlySales = [62, 66, 64, 71, 75, 79, 84, 82, 88, 92, 95, 101];
const salesMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const collectionProgress = [
  { week: "W1", target: 100, actual: 92 },
  { week: "W2", target: 100, actual: 98 },
  { week: "W3", target: 100, actual: 87 },
  { week: "W4", target: 100, actual: 102 },
];

const lowStockRoutes = [
  { route: "Korangi Main", items: 7 },
  { route: "Saddar East", items: 5 },
  { route: "North Nazimabad", items: 4 },
  { route: "Gulshan Loop", items: 3 },
];

const categoryMix = [
  { label: "Soda", value: 46, color: "#2563eb" },
  { label: "Water", value: 33, color: "#06b6d4" },
  { label: "Juice", value: 15, color: "#f59e0b" },
  { label: "Energy", value: 6, color: "#ef4444" },
];

const alerts = [
  { id: "ALT-101", title: "7 SKU below minimum stock", severity: "High", time: "10 mins ago" },
  { id: "ALT-098", title: "Route KR-03 collection delay", severity: "Medium", time: "35 mins ago" },
  { id: "ALT-094", title: "2 invoices pending approval", severity: "Low", time: "1 hour ago" },
];

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

function categoryGradient(mix: typeof categoryMix) {
  let start = 0;

  const stops = mix.map((item) => {
    const end = start + item.value;
    const stop = `${item.color} ${start}% ${end}%`;
    start = end;
    return stop;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

const linePoints = computeLinePoints(monthlySales);

export default function DashboardPage() {
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
              { label: "Dashboard", href: "/", active: true },
              { label: "Inventory", href: "/inventory", active: false },
              { label: "Purchase Orders", href: "/purchase-orders", active: false },
              { label: "Customers", href: "/customers", active: false },
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
              Today Snapshot
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Orders Processed</span>
                <span className="font-semibold text-slate-900">138</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Dispatch Accuracy</span>
                <span className="font-semibold text-emerald-600">98.2%</span>
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
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Al-Noor Beverages</p>
                  <p className="text-sm font-semibold text-slate-900">Dashboard</p>
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white">
                  <Settings className="h-4 w-4" />
                </Button>
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
                <Button className="h-11 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
                  Open Analysis
                </Button>
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
                  <CardTitle className="text-lg font-semibold text-slate-950">Monthly Sales Trend (PKR Mn)</CardTitle>
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
                  <CardTitle className="text-lg font-semibold text-slate-950">Category Sales Mix</CardTitle>
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
                        <span className="font-semibold text-slate-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-950">Collections vs Target</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {collectionProgress.map((item) => (
                    <div key={item.week}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.week}</span>
                        <span className="font-medium text-slate-700">{item.actual}% achieved</span>
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
                  <CardTitle className="text-lg font-semibold text-slate-950">Low Stock by Route</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lowStockRoutes.map((item) => (
                    <div key={item.route}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.route}</span>
                        <span className="font-medium text-red-600">{item.items} items</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-red-500" style={{ width: `${item.items * 12}%` }} />
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
                    3 active alerts
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
  );
}
