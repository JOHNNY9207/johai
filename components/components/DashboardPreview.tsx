const metrics = [["147", "AI conversations today"], ["23", "Appointments booked"], ["42", "Leads qualified"], ["98%", "Customer satisfaction"]];
export default function DashboardPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">Dashboard</p>
      <h2 className="max-w-4xl text-5xl font-black leading-tight md:text-6xl">Track your AI activity in one powerful dashboard.</h2>
      <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <div className="grid gap-6 md:grid-cols-4">{metrics.map(([number, label]) => <div key={label} className="rounded-3xl bg-black/30 p-6"><p className="text-4xl font-black text-blue-400">{number}</p><p className="mt-3 text-gray-400">{label}</p></div>)}</div>
        <div className="mt-8 rounded-3xl bg-[#0B1220] p-6">
          <p className="mb-4 text-lg font-bold">Live AI Workflow</p>
          <div className="space-y-4 text-gray-300"><p>✓ Customer message received</p><p>✓ JOHAI answered instantly</p><p>✓ Lead qualified automatically</p><p>✓ Appointment booked</p><p>✓ CRM updated</p></div>
        </div>
      </div>
    </section>
  );
}
