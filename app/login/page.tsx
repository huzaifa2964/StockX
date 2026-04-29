"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        router.push("/");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_28%)]" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-200/80">
              StockX
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight">
              Control the warehouse, collections, and purchase flow from one desk.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              A clean login gateway for staff, managers, and owners working across inventory, customers, and procurement.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-100 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Fast access</span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">Secure</span>
            </div>
            <div className="grid gap-2 text-slate-200">
              <p>• Inventory adjustments</p>
              <p>• Purchase order approvals</p>
              <p>• Customer account tracking</p>
              <p>• Pakistan PKR billing workflow</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                StockX
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Sign in to StockX
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your Supabase account to open the inventory and operations dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-between">
                <a href="mailto:admin@alnoorbeverages.pk" className="font-medium text-blue-700 hover:text-blue-800">
                  Forgot password?
                </a>
                <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">
                  Back to dashboard
                </Link>
              </div>

              <p className="text-center text-sm text-slate-500">
                New here?{" "}
                <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-800">
                  Create an account
                </Link>
              </p>
            </form>

          </div>
        </section>
      </div>
    </div>
  );
}
