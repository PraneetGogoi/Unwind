"use client";

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-dots-bg text-ink selection:bg-ink selection:text-paper">
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="font-display text-5xl md:text-7xl mb-8">
          Burnout Analytics
        </h1>
        <div className="brutal-card bg-paper p-8">
          <div className="h-10 border-b-2 border-ink flex items-center px-4 bg-frame -mx-8 -mt-8 mb-8">
            <div className="font-mono text-xs font-bold">dashboard.html</div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="p-12 border-2 border-dashed border-ink flex items-center justify-center text-grey-text font-bold">
              [ Embedded Plotly Chart: Burnout Distribution ]
            </div>
            <div className="p-12 border-2 border-dashed border-ink flex items-center justify-center text-grey-text font-bold">
              [ Embedded Plotly Chart: Feature Importance ]
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
