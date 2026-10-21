"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const email = searchParams.get("email");

  if (status === "success") return <SuccessState />;
  if (status === "expired") return <ExpiredState email={email} />;
  return <InvalidState />;
}

function SuccessState() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-6 text-green-500" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Email verified</h1>
          <p className="text-sm text-muted-foreground">
            Your email has been verified. You can now sign in to your account.
          </p>
        </div>
        <NextLink
          href="/sign-in?verified=true"
          className={cn(buttonVariants(), "w-full")}
        >
          Sign in
        </NextLink>
      </div>
    </div>
  );
}

function ExpiredState({ email }: { email: string | null }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setError("");

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setResending(false);

    if (res.ok) {
      setResent(true);
      return;
    }

    if (res.status === 429) {
      const data = await res.json();
      setError(data.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-yellow-500/10">
          <AlertTriangle className="size-6 text-yellow-500" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            This verification link has expired. Request a new one below.
          </p>
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {resent ? (
          <p className="text-sm text-muted-foreground">
            New verification email sent. Check your inbox.
          </p>
        ) : (
          <Button
            className="w-full"
            onClick={handleResend}
            disabled={resending || !email}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
        )}
      </div>
    </div>
  );
}

function InvalidState() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-6 text-destructive" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Invalid link</h1>
          <p className="text-sm text-muted-foreground">
            This verification link is invalid or has already been used.
          </p>
        </div>
        <NextLink
          href="/register"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Create a new account
        </NextLink>
      </div>
    </div>
  );
}
