import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          {/* Spacer for mobile menu button */}
          <div className="w-9 md:hidden" />

          <div className="flex flex-1 justify-center">
            <div className="flex h-9 w-full max-w-[560px] items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 text-muted-foreground">
              <Search className="size-4 shrink-0" />
              <span className="flex-1 truncate text-sm">
                Search items, tags, collections…
              </span>
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>

          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
