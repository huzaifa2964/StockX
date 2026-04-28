import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Manage Profile</h1>
            <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-800">
              Back to Dashboard
            </Link>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>This section is ready for your profile fields (name, phone, role, password).</p>
              <p>Next step can be connecting it with Supabase user metadata updates.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
