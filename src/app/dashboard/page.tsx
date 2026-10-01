export default function DashboardPage() {
  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border p-4 md:block">
        <h2 className="text-lg font-semibold text-foreground">Sidebar</h2>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-foreground">Main</h2>
      </main>
    </>
  );
}
