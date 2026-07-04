const services = [
  {
    title: "AI Chatbots",
    description:
      "24/7 intelligent assistants that answer questions, qualify leads and book appointments automatically.",
    icon: "🤖",
  },
  {
    title: "Business Automation",
    description:
      "Automate repetitive workflows, emails, CRM updates and internal processes.",
    icon: "⚙️",
  },
  {
    title: "AI Websites",
    description:
      "Modern multilingual websites optimized for conversions and AI integration.",
    icon: "🌍",
  },
  {
    title: "CRM Systems",
    description:
      "Connect your business with HubSpot, GoHighLevel, Salesforce and custom CRMs.",
    icon: "📈",
  },
  {
    title: "Lead Generation",
    description:
      "Capture, qualify and follow up with every lead automatically.",
    icon: "🎯",
  },
  {
    title: "Voice AI",
    description:
      "AI phone assistants that answer calls, schedule meetings and support customers.",
    icon: "🎙️",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-blue-400">
        Services
      </p>

      <h2 className="max-w-4xl text-5xl font-black leading-tight md:text-6xl">
        Everything your business needs to automate and grow.
      </h2>

      <p className="mt-6 max-w-3xl text-lg text-gray-400">
        We design complete AI ecosystems for companies of every size,
        helping them save time, increase revenue and deliver a better
        customer experience.
      </p>

      <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-500/40 hover:bg-white/10"
          >
            <div className="mb-6 text-5xl">{service.icon}</div>

            <h3 className="text-3xl font-bold">
              {service.title}
            </h3>

            <p className="mt-5 leading-8 text-gray-400">
              {service.description}
            </p>

            <button className="mt-8 font-semibold text-blue-400 transition hover:text-blue-300">
              Learn more →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}