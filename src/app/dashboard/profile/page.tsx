import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileData, getItemTypeBreakdown } from "@/lib/db/user";
import { getItemStats } from "@/lib/db/items";
import { getTotalCollectionCount } from "@/lib/db/collections";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";
import { Layers, FolderOpen, Calendar, Mail, Shield } from "lucide-react";
import { iconMap } from "@/components/dashboard/icon-map";
import { ProfileActions } from "./profile-actions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [profile, typeBreakdown, itemStats, totalCollections] =
    await Promise.all([
      getProfileData(session.user.id),
      getItemTypeBreakdown(session.user.id),
      getItemStats(session.user.id),
      getTotalCollectionCount(session.user.id),
    ]);

  if (!profile) redirect("/sign-in");

  const joinDate = profile.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* User info */}
      <section className="rounded-xl border border-border bg-[#111114] p-6">
        <div className="flex items-start gap-5">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            size={64}
            className="text-lg"
          />
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold tracking-tight">
              {profile.name ?? "User"}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {profile.email}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              Joined {joinDate}
            </div>
            <div className="flex items-center gap-3 pt-1">
              {profile.hasPassword && (
                <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  <Shield className="size-3" />
                  Email
                </span>
              )}
              {profile.providers.includes("github") && (
                <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Usage stats */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[13px] font-semibold text-foreground">
          Usage stats
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-[#111114] p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Layers className="size-[18px] text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight">
                {itemStats.totalItems}
              </span>
              <span className="text-xs text-muted-foreground">Total items</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-[#111114] p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <FolderOpen className="size-[18px] text-purple-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight">
                {totalCollections}
              </span>
              <span className="text-xs text-muted-foreground">Collections</span>
            </div>
          </div>
        </div>

        {/* Item type breakdown */}
        <div className="rounded-xl border border-border bg-[#111114] p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Items by type
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {typeBreakdown.map((type) => {
              const Icon = iconMap[type.icon];
              return (
                <div
                  key={type.name}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                >
                  {Icon && (
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: type.color + "1a",
                        color: type.color,
                      }}
                    >
                      <Icon className="size-3.5" />
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="font-mono text-xs text-muted-foreground/60">
                      {type.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Account actions */}
      <Separator />

      <ProfileActions hasPassword={profile.hasPassword} />
    </div>
  );
}
