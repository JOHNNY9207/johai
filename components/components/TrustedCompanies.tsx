const technologies = ["OpenAI", "Anthropic", "Google Cloud", "Microsoft Azure", "Stripe", "HubSpot", "n8n", "Vercel"];
export default function TrustedCompanies() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">Built with modern AI and automation technologies</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-lg font-black text-gray-600 md:gap-10 md:text-xl">
          {technologies.map((tech) => <span key={tech} className="transition hover:text-white">{tech}</span>)}
        </div>
      </div>
    </section>
  );
}
