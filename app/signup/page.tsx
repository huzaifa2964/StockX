"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        setSuccess("Account created successfully. Please check your email to confirm your account.");
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("An error occurred while creating your account. Please try again.");
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
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-blue-600 px-10 py-12 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_34%)]" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/80">
              StockX
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight">
              Create a secure account for operations, procurement, and collections.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-blue-50/90">
              Set up managers and staff with a clean signup flow for the StockX dashboard.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-semibold">Included access</p>
            <div className="mt-3 grid gap-2 text-sm text-blue-50/90">
              <p>• Inventory and stock control</p>
              <p>• Customer account ledger</p>
              <p>• Purchase order creation</p>
              <p>• Future role-based access support</p>
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
                Create your account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Join the Supabase-backed dashboard for warehouse and procurement operations.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ahsan Malik"
                />
              </div>

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
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-700">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-between">
                <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
                  Already have an account?
                </Link>
                <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">
                  Back to dashboard
                </Link>
              </div>
            </form>

          </div>
        </section>
      </div>
    </div>
  );
}