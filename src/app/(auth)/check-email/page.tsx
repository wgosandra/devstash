"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setResending(false);
    if (res.ok) setResent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Mail className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{" "}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              "your email"
            )}
            . Click the link to activate your account.
          </p>
        </div>

        <div className="space-y-3">
          {resent ? (
            <p className="text-sm text-muted-foreground">
              Verification email resent. Check your inbox.
            </p>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending || !email}
            >
              {resending ? "Resending..." : "Resend verification email"}
            </Button>
          )}

          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
            <NextLink
              href="/sign-in"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </NextLink>
          </p>
        </div>
      </div>
    </div>
  );
}
