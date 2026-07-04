const companies = ["OpenAI", "Stripe", "HubSpot", "Zapier", "Google", "Microsoft", "Meta"];

export default function TrustedCompanies() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
          Built for ambitious businesses using modern technology
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-xl font-black text-gray-600">
          {companies.map((company) => (
            <span key={company} className="transition hover:text-white">
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}