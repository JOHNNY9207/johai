import { createSupabaseServerClient, type Lead } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createSupabaseServerClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leadList = (leads ?? []) as Lead[];
  const qualifiedLeads = leadList.filter(
    (lead) =>
      lead.first_name &&
      lead.email &&
      lead.business_name &&
      lead.business_type &&
      lead.biggest_problem
  );

  return (
    <main className="min-h-screen bg-[#08111f] p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold">JOHAI CRM Dashboard</h1>

      <div className="mb-8 grid grid-cols-4 gap-6">
        <div className="rounded-2xl bg-[#111827] p-6">
          <p className="text-gray-400">Total Leads</p>
          <h2 className="text-4xl font-bold">{leadList.length}</h2>
        </div>

        <div className="rounded-2xl bg-[#111827] p-6">
          <p className="text-gray-400">Booked Calls</p>
          <h2 className="text-4xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl bg-[#111827] p-6">
          <p className="text-gray-400">Qualified Leads</p>
          <h2 className="text-4xl font-bold">{qualifiedLeads.length}</h2>
        </div>

        <div className="rounded-2xl bg-[#111827] p-6">
          <p className="text-gray-400">Revenue Potential</p>
          <h2 className="text-4xl font-bold">$0</h2>
        </div>
      </div>

      <div className="rounded-2xl bg-[#111827] p-6">
        <h2 className="mb-6 text-2xl font-bold">Latest Leads</h2>

        {error && (
          <p className="rounded-xl bg-red-500/10 p-4 text-red-300">
            The CRM dashboard could not load leads right now.
          </p>
        )}

        {!error && leadList.length === 0 && (
          <p className="rounded-xl bg-white/5 p-4 text-gray-300">
            No leads have been saved yet.
          </p>
        )}

        {!error && leadList.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="pb-3">Name</th>
                <th className="pb-3">Business</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Problem</th>
              </tr>
            </thead>

            <tbody>
              {leadList.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-800">
                  <td className="py-4">{lead.first_name}</td>
                  <td>{lead.business_name}</td>
                  <td>{lead.business_type}</td>
                  <td>{lead.email}</td>
                  <td>{lead.biggest_problem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
