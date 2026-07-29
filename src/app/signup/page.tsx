"use client";

import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import AuthShell from "@/components/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create an account"
      subtitle="One click with Google — no password to manage."
    >
      <div className="mt-8">
        <GoogleSignInButton label="Sign up with Google" />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
