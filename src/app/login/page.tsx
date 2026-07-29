"use client";

import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell title="Log in" subtitle="Welcome back to NexApp.">
      <div className="mt-8">
        <GoogleSignInButton label="Continue with Google" />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        New here?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
