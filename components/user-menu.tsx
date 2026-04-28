"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Settings, SlidersHorizontal, UserCircle2 } from "lucide-react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateCurrentUserProfile } from "@/lib/supabase";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "Signed in user";

  useEffect(() => {
    if (!user) {
      setAccountName("");
      setEmail("");
      return;
    }
    const fallbackName = user.email?.split("@")[0] ?? "";
    setAccountName((user.user_metadata?.full_name as string | undefined) ?? fallbackName);
    setEmail(user.email ?? "");
  }, [user]);

  const handleLogout = async () => {
    setError("");
    setIsSigningOut(true);

    try {
      const { error: signOutError } = await signOut();
      if (signOutError) {
        setError(signOutError.message);
        return;
      }
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Unable to log out right now. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleProfileSave = async () => {
    setError("");
    setIsSavingProfile(true);

    try {
      const { error: profileError } = await updateCurrentUserProfile(
        accountName.trim(),
        email.trim()
      );
      if (profileError) {
        setError(profileError.message);
        return;
      }
      setIsProfileDialogOpen(false);
    } catch (err) {
      console.error(err);
      setError("Unable to update profile right now. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    if (compact) {
      return (
        <Link href="/login">
          <Button variant="outline" className="h-10 rounded-full border-slate-200 bg-white px-3 text-sm text-slate-700">
            Sign In
          </Button>
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" className="h-10 rounded-full px-4 text-sm text-slate-700 hover:bg-slate-100">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button className="h-10 rounded-full bg-blue-600 px-4 text-sm text-white hover:bg-blue-700">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">Agency Manager</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 rounded-full border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all hover:bg-slate-100"
            >
              <UserCircle2 className={compact ? "h-4 w-4" : "mr-2 h-4 w-4"} />
              {compact ? <span className="sr-only">Manage Account</span> : "Manage Account"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={() => setIsProfileDialogOpen(true)}>
              <Settings />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/profile?tab=preferences")}>
              <SlidersHorizontal />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              disabled={isSigningOut}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut />
              <span>{isSigningOut ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {error ? <p className="hidden text-xs text-red-600 lg:block">{error}</p> : null}

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>Update your account name and email address.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="account-name">
                Account Name
              </label>
              <Input
                id="account-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="account-email">
                Email
              </label>
              <Input
                id="account-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProfileDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProfileSave}
              disabled={isSavingProfile}
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
