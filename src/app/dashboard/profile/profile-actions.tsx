"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { DeleteAccountDialog } from "@/components/dashboard/delete-account-dialog";

export function ProfileActions({ hasPassword }: { hasPassword: boolean }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[13px] font-semibold text-foreground">
        Account actions
      </h2>

      {hasPassword && (
        <div className="rounded-xl border border-border bg-[#111114] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Change password</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            {!showPasswordForm && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => setShowPasswordForm(true)}
              >
                <KeyRound className="size-3.5" />
                Change
              </Button>
            )}
          </div>
          {showPasswordForm && (
            <div className="mt-4 max-w-sm">
              <ChangePasswordForm
                onClose={() => setShowPasswordForm(false)}
              />
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-destructive/20 bg-[#111114] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-destructive">
              Danger zone
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </div>
    </section>
  );
}
